import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { openaiClient } from '@/lib/ai/openai';
import { serializeAdminView } from '@/lib/serializers';
import { calculateCompatibility } from '@/lib/matchingEngine';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { message, activeCustomerId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const text = message.trim();
    const lowerText = text.toLowerCase();

    // 1. Fetch all DB customers to search & match
    const rawAll = await prisma.customer.findMany({
      include: {
        preference: true,
        notes: true,
        timeline: true,
      },
    });

    const allCustomers = rawAll.map((c) => serializeAdminView(c));

    // 2. Identify target customer from text or session context
    let targetCustomer = allCustomers.find((c) => c.id === activeCustomerId);

    if (!targetCustomer) {
      // Extract mentioned name from message
      const tokens = text.split(/\s+/).map((t) => t.replace(/[^a-zA-Z]/g, '')).filter(Boolean);
      for (const token of tokens) {
        if (token.length < 3) continue;
        const match = allCustomers.find(
          (c) =>
            c.firstName.toLowerCase() === token.toLowerCase() ||
            c.lastName.toLowerCase() === token.toLowerCase() ||
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(token.toLowerCase())
        );
        if (match) {
          targetCustomer = match;
          break;
        }
      }
    }

    // Default to first customer if no target specified and asking for match recommendations
    if (!targetCustomer && (lowerText.includes('match') || lowerText.includes('candidate') || lowerText.includes('find'))) {
      targetCustomer = allCustomers[0];
    }

    // 3. Perform deterministic calculations & fetch relationship data if target customer exists
    let matchResults: any[] = [];
    if (targetCustomer) {
      const oppositeGenderPool = allCustomers.filter(
        (c) => c.gender !== targetCustomer.gender && c.id !== targetCustomer.id
      );

      // Query real DB relationship records for target customer
      const targetUserId = targetCustomer.userId;

      const dbMatches = await prisma.match.findMany({
        where: {
          OR: [
            { customerId: targetCustomer.id },
            { candidateId: targetCustomer.id },
          ],
        },
      });

      const dbShortlists = targetUserId
        ? await prisma.shortlist.findMany({ where: { userId: targetUserId } })
        : [];

      const dbRequests = targetUserId
        ? await prisma.matchRequest.findMany({
            where: {
              OR: [{ senderId: targetUserId }, { receiverId: targetUserId }],
            },
          })
        : [];

      matchResults = oppositeGenderPool
        .map((candidate) => {
          const comp = calculateCompatibility(targetCustomer as any, candidate as any);
          const candUserId = candidate.userId;

          // Resolve relationship state
          const relMatch = dbMatches.find(
            (m) =>
              (m.customerId === targetCustomer.id && m.candidateId === candidate.id) ||
              (m.customerId === candidate.id && m.candidateId === targetCustomer.id)
          );

          const relShortlist = dbShortlists.find((s) => s.candidateId === candidate.id);

          const relRequest = candUserId
            ? dbRequests.find(
                (r) =>
                  (r.senderId === targetUserId && r.receiverId === candUserId) ||
                  (r.senderId === candUserId && r.receiverId === targetUserId)
              )
            : null;

          return {
            candidateId: candidate.id,
            name: `${candidate.firstName} ${candidate.lastName}`,
            gender: candidate.gender,
            age: candidate.age,
            city: candidate.city,
            profession: `${candidate.profession.designation} at ${candidate.profession.company}`,
            score: comp.score,
            scoreBreakdown: comp.scoreBreakdown,
            education: `${candidate.education.degree} (${candidate.education.undergradCollege})`,
            diet: candidate.lifestyle.diet,
            matchStatus: relMatch ? relMatch.status : 'None',
            shortlistStatus: relShortlist ? 'Shortlisted' : 'Not Shortlisted',
            requestStatus: relRequest ? `Request ${relRequest.status}` : 'None',
          };
        })
        .sort((a, b) => b.score - a.score);
    }

    // 4. Check if prompt asks for comparison of 2 profiles
    let comparisonTarget: any = null;
    if (targetCustomer) {
      const remainingTokens = text
        .split(/\s+/)
        .map((t) => t.replace(/[^a-zA-Z]/g, ''))
        .filter((t) => t.length >= 3 && t.toLowerCase() !== targetCustomer?.firstName.toLowerCase());
      for (const token of remainingTokens) {
        const match = allCustomers.find(
          (c) =>
            c.id !== targetCustomer.id &&
            (c.firstName.toLowerCase() === token.toLowerCase() || c.lastName.toLowerCase() === token.toLowerCase())
        );
        if (match) {
          comparisonTarget = match;
          break;
        }
      }
    }

    // Build context summary for AI
    const primaryInfo = targetCustomer
      ? `PRIMARY TARGET CLIENT: ${targetCustomer.firstName} ${targetCustomer.lastName} (ID: ${targetCustomer.id}, Gender: ${targetCustomer.gender}, Age: ${targetCustomer.age}, City: ${targetCustomer.city}, Profession: ${targetCustomer.profession.designation}, Religion: ${targetCustomer.religion}, Caste: ${targetCustomer.caste})`
      : 'NO SPECIFIC TARGET CLIENT MENTIONED';

    const topMatchesContext = matchResults.slice(0, 5).map((m, idx) => `
Candidate #${idx + 1}: ${m.name} (ID: ${m.candidateId})
- Gender: ${m.gender}, Age: ${m.age}, City: ${m.city}
- Profession: ${m.profession}
- Education: ${m.education}
- DETERMINISTIC ENGINE SCORE: ${m.score}%
- Breakdown: Age: ${m.scoreBreakdown.age}/15, Education: ${m.scoreBreakdown.education}/15, Career: ${m.scoreBreakdown.career}/15, Religion: ${m.scoreBreakdown.religion}/15, Family: ${m.scoreBreakdown.family}/10, Lifestyle: ${m.scoreBreakdown.lifestyle}/10, Relocation: ${m.scoreBreakdown.relocation}/10, Children: ${m.scoreBreakdown.children}/10
- RELATIONSHIP STATE: Match Record = ${m.matchStatus} | Shortlist = ${m.shortlistStatus} | Interest Request = ${m.requestStatus}
`).join('\n');

    let comparisonContext = '';
    if (targetCustomer && comparisonTarget) {
      const comp = calculateCompatibility(targetCustomer as any, comparisonTarget as any);
      comparisonContext = `
COMPARISON PAIR:
Target: ${targetCustomer.firstName} ${targetCustomer.lastName} (${targetCustomer.gender}, ${targetCustomer.age})
Candidate: ${comparisonTarget.firstName} ${comparisonTarget.lastName} (${comparisonTarget.gender}, ${comparisonTarget.age})
DETERMINISTIC COMPATIBILITY SCORE: ${comp.score}%
Score Breakdown: Age: ${comp.scoreBreakdown.age}/15, Education: ${comp.scoreBreakdown.education}/15, Career: ${comp.scoreBreakdown.career}/15, Religion: ${comp.scoreBreakdown.religion}/15, Family: ${comp.scoreBreakdown.family}/10, Lifestyle: ${comp.scoreBreakdown.lifestyle}/10, Relocation: ${comp.scoreBreakdown.relocation}/10, Children: ${comp.scoreBreakdown.children}/10
`;
    }

    const systemPrompt = `
You are the expert AI Matchmaker Copilot for TDC Matchmaker CRM.
Your job is to assist matchmakers with candidate recommendations, compatibility explanations, profile comparisons, and client advisory notes.

CRITICAL SCORE GUARDRAIL:
The compatibility percentages and score breakdowns provided below originate from our deterministic 8-dimension matching engine.
You MUST use these exact numeric scores (e.g. ${matchResults[0]?.score || 85}%).
Do NOT invent, alter, recalculate, or hallucinate compatibility percentages or dimension sub-scores.

PLATFORM CONTEXT:
- Total Seeded Clients in Database: ${allCustomers.length}
${primaryInfo}

${comparisonContext}

DETERMINISTIC ENGINE TOP MATCHES & RELATIONSHIP STATES FOR TARGET CLIENT:
${topMatchesContext || 'No matches calculated.'}

FORMATTING GUIDELINES:
- Use clear GitHub-style Markdown (headers, bullet points, bold key terms).
- For candidate recommendations, format each candidate clearly with their exact match percentage, key compatibility strengths (e.g. Education, Career, Location), relationship status (e.g., Shortlisted, Request Pending), and a matchmaker recommendation.
- Maintain a warm, analytical, and professional matchmaker persona.
`;

    // 5. Fallback Response Function if OpenAI is unavailable
    const generateFallback = () => {
      if (!targetCustomer) {
        return `### Matchmaker CRM Assistant Overview\n\nWe currently have **${allCustomers.length} verified matrimonial clients** in our database.\n\nPlease specify a client's name (e.g., *"Find best matches for Ruksana"* or *"Show top matches for David"*) to analyze pairings.`;
      }

      if (comparisonTarget) {
        const comp = calculateCompatibility(targetCustomer as any, comparisonTarget as any);
        return `### Profile Comparison: ${targetCustomer.firstName} vs ${comparisonTarget.firstName}\n\n**Deterministic Match Score: ${comp.score}%**\n\n#### Compatibility Breakdown:\n- **Age Alignment**: ${comp.scoreBreakdown.age}/15\n- **Education**: ${comp.scoreBreakdown.education}/15\n- **Career & Stability**: ${comp.scoreBreakdown.career}/15\n- **Religion & Caste**: ${comp.scoreBreakdown.religion}/15\n- **Family Values**: ${comp.scoreBreakdown.family}/10\n- **Lifestyle & Habits**: ${comp.scoreBreakdown.lifestyle}/10\n- **Location & Relocation**: ${comp.scoreBreakdown.relocation}/10\n- **Family Planning / Children**: ${comp.scoreBreakdown.children}/10\n\n*Note: AI natural-language analysis is currently in offline fallback mode, displaying direct deterministic matching engine data.*`;
      }

      const top5 = matchResults.slice(0, 5);
      const candidatesList = top5
        .map(
          (m, idx) =>
            `**${idx + 1}. ${m.name} — ${m.score}% Match**\n- **Location & Profession**: ${m.city} • ${m.profession}\n- **Education**: ${m.education}\n- **Relationship Status**: Match (${m.matchStatus}) • ${m.shortlistStatus} • ${m.requestStatus}\n- **Matchmaker Note**: Strongly recommended for client introduction.`
        )
        .join('\n\n');

      return `### Recommended Matrimonial Matches for ${targetCustomer.firstName} ${targetCustomer.lastName}\n\nTarget Client: **${targetCustomer.gender}, ${targetCustomer.age} yrs, ${targetCustomer.city}** (${targetCustomer.profession.designation})\n\n${candidatesList}\n\n---\n*Scores calculated deterministically by the MatchMaker engine.*`;
    };

    // 6. Call OpenAI API if client is available
    if (!openaiClient) {
      return NextResponse.json({
        success: true,
        targetCustomerId: targetCustomer?.id || null,
        targetCustomerName: targetCustomer ? `${targetCustomer.firstName} ${targetCustomer.lastName}` : null,
        reply: generateFallback(),
        isFallback: true,
      });
    }

    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.6,
      });

      const reply = response.choices[0]?.message?.content || generateFallback();

      return NextResponse.json({
        success: true,
        targetCustomerId: targetCustomer?.id || null,
        targetCustomerName: targetCustomer ? `${targetCustomer.firstName} ${targetCustomer.lastName}` : null,
        reply,
        isFallback: false,
      });
    } catch (openaiErr) {
      console.error('OpenAI Agent API Call Error:', openaiErr);
      return NextResponse.json({
        success: true,
        targetCustomerId: targetCustomer?.id || null,
        targetCustomerName: targetCustomer ? `${targetCustomer.firstName} ${targetCustomer.lastName}` : null,
        reply: generateFallback(),
        isFallback: true,
      });
    }
  } catch (error: any) {
    console.error('Admin Agent Controller Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
