import { NextResponse } from 'next/server';
import { getCustomerById, getCustomers, getMatchStates } from '@/lib/db';
import { getTopMatches } from '@/lib/matchingEngine';
import { generateAIMatchPitches } from '@/lib/openai';
import { MatchRecommendation } from '@/types/matchmaker';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getCustomerById(id);
    if (!client) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const pool = getCustomers();
    const matchStates = getMatchStates();

    // Get Top 10 matches from rule-based engine
    const topScored = getTopMatches(client, pool, 10);

    const recommendations: MatchRecommendation[] = [];

    // For each top match, merge with saved state and generate AI text
    for (const item of topScored) {
      const prospect = item.profile;
      
      // Find if we already have a saved action status or cached AI text
      const existingState = matchStates.find(
        m => m.customerId === client.id && m.matchId === prospect.id
      );

      let aiExplanation = '';
      let aiIntroduction = '';

      if (existingState?.aiExplanation && existingState?.aiIntroduction) {
        // Use cached values if available
        aiExplanation = existingState.aiExplanation;
        aiIntroduction = existingState.aiIntroduction;
      } else {
        // Generate new values (calls OpenAI or fallback)
        const pitch = await generateAIMatchPitches(client, prospect, item.score);
        aiExplanation = pitch.aiExplanation;
        aiIntroduction = pitch.aiIntroduction;
      }

      recommendations.push({
        ...item,
        aiExplanation,
        aiIntroduction,
        status: existingState?.status // saved, rejected, sent, or undefined
      });
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('API Recommendations error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
