import { Customer } from '../types/matchmaker';

interface AIResult {
  aiExplanation: string;
  aiIntroduction: string;
}

// Generates high-fidelity mock explanations and introductions by checking overlap
function generateMockAIResult(client: Customer, prospect: Customer, score: number): AIResult {
  const commonIndustries = client.profession.industry === prospect.profession.industry;
  const bothPostgrad = client.education.postgradDegree && prospect.education.postgradDegree;
  const sameCity = client.city === prospect.city;
  const commonDiet = client.lifestyle.diet === prospect.lifestyle.diet;
  const commonPets = client.lifestyle.openToPets && prospect.lifestyle.openToPets;

  // Build points of synergy
  const synergies: string[] = [];
  if (sameCity) {
    synergies.push(`both reside in the vibrant city of ${client.city}`);
  } else {
    synergies.push(`have compatible location preferences, bridging ${client.city} and ${prospect.city}`);
  }

  if (commonIndustries) {
    synergies.push(`share a professional background in the ${client.profession.industry} sector`);
  } else {
    synergies.push(`have complementary careers in ${client.profession.industry} and ${prospect.profession.industry}`);
  }

  if (bothPostgrad) {
    synergies.push('both hold postgraduate credentials from top-tier institutions');
  }

  if (commonDiet) {
    synergies.push(`share a similar ${client.lifestyle.diet.toLowerCase()} diet preference`);
  }

  if (commonPets) {
    synergies.push('are both open to keeping pets at home');
  }

  const synergyString = synergies.slice(0, -1).join(', ') + (synergies.length > 1 ? ', and ' : '') + synergies[synergies.length - 1];

  let explanation = '';
  if (score >= 85) {
    explanation = `Outstanding Match (Score: ${score}%) because both individuals share deeply aligned core values, family expectations, and relocation preferences. They ${synergyString}. Their professional paths suggest highly complementary lifestyles and solid long-term stability.`;
  } else if (score >= 70) {
    explanation = `High Potential Match (Score: ${score}%) because both individuals show good compatibility in lifestyles and family values. They ${synergyString}. Their educational backgrounds are well-suited, and they share highly compatible outlooks regarding career growth and children.`;
  } else {
    explanation = `Moderate Compatibility Match (Score: ${score}%) with notable areas of alignment. They ${synergyString}. While there are slight differences in lifestyle details, their core preferences around religion, caste, and long-term family goals are well-matched.`;
  }

  // Generate personalized introduction pitch
  let introduction = '';
  const clientName = client.firstName;
  const prospectName = prospect.firstName;
  const prospectRole = prospect.profession.designation;
  const prospectLoc = prospect.city;

  if (client.gender === 'Female') {
    introduction = `Hi ${clientName}, we would like to introduce you to ${prospectName}. He is a ${prospectRole} based in ${prospectLoc} who is highly established in his career. He shares your values around family structure (${prospect.family.familyType.toLowerCase()} family setup), lifestyle choices, and future goals. We believe you two would have very stimulating conversations.`;
  } else {
    introduction = `Hi ${clientName}, we would like to introduce you to ${prospectName}. She is a ${prospectRole} based in ${prospectLoc} with an impressive academic background from ${prospect.education.undergradCollege}. She is looking for someone who shares her interest in a stable home, matches her ${prospect.lifestyle.diet.toLowerCase()} lifestyle, and holds similar family expectations.`;
  }

  return {
    aiExplanation: explanation,
    aiIntroduction: introduction
  };
}

export async function generateAIMatchPitches(
  client: Customer,
  prospect: Customer,
  score: number
): Promise<AIResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY' || apiKey.trim() === '') {
    // Return high-fidelity local fallback when no key is set
    return generateMockAIResult(client, prospect, score);
  }

  try {
    const prompt = `
You are an expert matchmaker writing custom compatibility analysis and introduction pitches.
Analyze the compatibility between two individuals:

CLIENT (PRIMARY):
- Name: ${client.firstName} ${client.lastName}
- Gender: ${client.gender}
- Age: ${client.age}
- City: ${client.city}
- Religion/Caste: ${client.religion} (${client.caste})
- Education: ${client.education.degree} from ${client.education.undergradCollege} ${client.education.postgradDegree ? `and ${client.education.postgradDegree}` : ''}
- Profession: ${client.profession.designation} at ${client.profession.company} (${client.profession.income} LPA, Industry: ${client.profession.industry})
- Family: ${client.family.familyType} family
- Lifestyle: Diet: ${client.lifestyle.diet}, Smoking: ${client.lifestyle.smoking}, Drinking: ${client.lifestyle.drinking}, Open to Pets: ${client.lifestyle.openToPets ? 'Yes' : 'No'}
- Preferences: Age: ${client.preferences.ageMin}-${client.preferences.ageMax}, Location: ${client.preferences.locations.join(', ')}, Religion: ${client.preferences.religions.join(', ')}, Family: ${client.family.familyType} preferred, Manglik Status: ${client.preferences.manglikStatus}

PROSPECTIVE MATCH:
- Name: ${prospect.firstName} ${prospect.lastName}
- Gender: ${prospect.gender}
- Age: ${prospect.age}
- City: ${prospect.city}
- Religion/Caste: ${prospect.religion} (${prospect.caste})
- Education: ${prospect.education.degree} from ${prospect.education.undergradCollege} ${prospect.education.postgradDegree ? `and ${prospect.education.postgradDegree}` : ''}
- Profession: ${prospect.profession.designation} at ${prospect.profession.company} (${prospect.profession.income} LPA, Industry: ${prospect.profession.industry})
- Family: ${prospect.family.familyType} family
- Lifestyle: Diet: ${prospect.lifestyle.diet}, Smoking: ${prospect.lifestyle.smoking}, Drinking: ${prospect.lifestyle.drinking}, Open to Pets: ${prospect.lifestyle.openToPets ? 'Yes' : 'No'}

COMPATIBILITY SCORE calculated by our engine: ${score}/100

Generate a JSON object containing two fields:
1. "aiExplanation": A paragraph (3-4 sentences) explaining to the matchmaker why these two are a strong match. Detail career alignment, location preferences, lifestyle matches (diet, pets), and family types. Make it sound analytical and staff-level professional.
2. "aiIntroduction": A warm, encouraging pitch (3-4 sentences) addressed directly to the CLIENT introducing the PROSPECT. Highlight the prospect's profession, city, education, and shared values to generate interest, without revealing the score directly.

Output ONLY a valid JSON object. Do not include markdown wraps (like \`\`\`json) or conversational text.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API returned status ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const parsed = JSON.parse(resultText);

    return {
      aiExplanation: parsed.aiExplanation || 'Analyzed matching details indicate positive alignment in lifestyle and preferences.',
      aiIntroduction: parsed.aiIntroduction || `Hi ${client.firstName}, we recommend reviewing this profile.`
    };
  } catch (error) {
    console.error('OpenAI generation failed, falling back to mock results:', error);
    return generateMockAIResult(client, prospect, score);
  }
}
