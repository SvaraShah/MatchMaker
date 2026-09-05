import { openaiClient } from './openai';

export interface AIResult {
  aiExplanation: string;
  aiIntroduction: string;
}

export function sanitizeForAI(profile: any) {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    gender: profile.gender,
    age: profile.age,
    city: profile.city,
    religion: profile.religion,
    caste: profile.caste,
    degree: profile.education?.degree || profile.degree,
    college: profile.education?.undergradCollege || profile.undergradCollege,
    postgradDegree: profile.education?.postgradDegree || profile.postgradDegree,
    designation: profile.profession?.designation || profile.designation,
    company: profile.profession?.company || profile.company,
    income: profile.profession?.income || profile.income,
    industry: profile.profession?.industry || profile.industry,
    familyType: profile.family?.familyType || profile.familyType,
    diet: profile.lifestyle?.diet || profile.diet,
    smoking: profile.lifestyle?.smoking || profile.smoking,
    drinking: profile.lifestyle?.drinking || profile.drinking,
    openToPets: profile.lifestyle?.openToPets ?? profile.openToPets,
  };
}

function generateFallbackResult(client: any, prospect: any, score: number): AIResult {
  const sameCity = client.city === prospect.city;
  const sameDiet = (client.lifestyle?.diet || client.diet) === (prospect.lifestyle?.diet || prospect.diet);
  const clientDesignation = client.profession?.designation || client.designation || 'professional';
  const prospectDesignation = prospect.profession?.designation || prospect.designation || 'professional';
  const prospectCity = prospect.city;
  const prospectCollege = prospect.education?.undergradCollege || prospect.undergradCollege || 'university';

  let explanation = '';
  if (score >= 85) {
    explanation = `Outstanding Match (Score: ${score}%). Both individuals display aligned core values, lifestyle expectations, and professional stability. ${sameCity ? `They both reside in ${client.city}.` : `Their locations (${client.city} & ${prospectCity}) are compatible.`} Their educational backgrounds complement each other for long-term alignment.`;
  } else if (score >= 70) {
    explanation = `High Potential Match (Score: ${score}%). They show good compatibility across lifestyle standards and career values. ${sameDiet ? `Both share a ${client.lifestyle?.diet || client.diet} diet preference.` : ''} Their backgrounds support productive mutual discussions.`;
  } else {
    explanation = `Moderate Compatibility Match (Score: ${score}%). Notable alignment in core family values and career orientation. Further discussions are recommended to explore mutual goals.`;
  }

  let introduction = '';
  if (client.gender === 'Female') {
    introduction = `Hi ${client.firstName}, we recommend reviewing ${prospect.firstName}'s profile. He is a ${prospectDesignation} based in ${prospectCity} with an impressive background. He shares your core family and lifestyle expectations.`;
  } else {
    introduction = `Hi ${client.firstName}, meet ${prospect.firstName}. She is a ${prospectDesignation} based in ${prospectCity} holding a degree from ${prospectCollege}. She is looking for a partner with compatible lifestyle choices and family values.`;
  }

  return {
    aiExplanation: explanation,
    aiIntroduction: introduction,
  };
}

export async function generateAIMatchPitches(
  client: any,
  prospect: any,
  score: number
): Promise<AIResult> {
  const fallback = generateFallbackResult(client, prospect, score);

  if (!openaiClient) {
    return fallback;
  }

  try {
    const cleanClient = sanitizeForAI(client);
    const cleanProspect = sanitizeForAI(prospect);

    const prompt = `
You are an expert matchmaker writing custom compatibility analysis and introduction pitches for a matrimony platform.

CLIENT (PRIMARY):
- Name: ${cleanClient.firstName} ${cleanClient.lastName}
- Gender: ${cleanClient.gender}, Age: ${cleanClient.age}, City: ${cleanClient.city}
- Religion/Caste: ${cleanClient.religion} (${cleanClient.caste})
- Education: ${cleanClient.degree} from ${cleanClient.college} ${cleanClient.postgradDegree ? `and ${cleanClient.postgradDegree}` : ''}
- Profession: ${cleanClient.designation} at ${cleanClient.company} (${cleanClient.income} LPA, Industry: ${cleanClient.industry})
- Family & Lifestyle: ${cleanClient.familyType} family, Diet: ${cleanClient.diet}, Smoking: ${cleanClient.smoking}, Drinking: ${cleanClient.drinking}, Pets: ${cleanClient.openToPets ? 'Yes' : 'No'}

PROSPECTIVE MATCH:
- Name: ${cleanProspect.firstName} ${cleanProspect.lastName}
- Gender: ${cleanProspect.gender}, Age: ${cleanProspect.age}, City: ${cleanProspect.city}
- Religion/Caste: ${cleanProspect.religion} (${cleanProspect.caste})
- Education: ${cleanProspect.degree} from ${cleanProspect.college} ${cleanProspect.postgradDegree ? `and ${cleanProspect.postgradDegree}` : ''}
- Profession: ${cleanProspect.designation} at ${cleanProspect.company} (${cleanProspect.income} LPA, Industry: ${cleanProspect.industry})
- Family & Lifestyle: ${cleanProspect.familyType} family, Diet: ${cleanProspect.diet}, Smoking: ${cleanProspect.smoking}, Drinking: ${cleanProspect.drinking}, Pets: ${cleanProspect.openToPets ? 'Yes' : 'No'}

DETERMINISTIC COMPATIBILITY SCORE: ${score}/100

Generate a valid JSON object with keys:
1. "aiExplanation": A paragraph (3-4 sentences) explaining to a matchmaker why these two align (career, location, diet, values).
2. "aiIntroduction": A warm pitch (3-4 sentences) addressed directly to ${cleanClient.firstName} introducing ${cleanProspect.firstName}.

Do NOT include markdown syntax or backticks. Return JSON ONLY.
`;

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return fallback;

    const parsed = JSON.parse(content);
    return {
      aiExplanation: parsed.aiExplanation || fallback.aiExplanation,
      aiIntroduction: parsed.aiIntroduction || fallback.aiIntroduction,
    };
  } catch (error) {
    console.error('OpenAI API match analysis failed:', error);
    return fallback;
  }
}
