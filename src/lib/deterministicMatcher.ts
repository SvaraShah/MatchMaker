import { MatrimonialProfile } from './mockData';

export interface ScoreBreakdown {
  age: number; // 0-10
  location: number; // 0-10
  religion: number; // 0-10
  jainPreference: number; // 0-10
  caste: number; // 0-10
  occupation: number; // 0-10
  education: number; // 0-10
  income: number; // 0-10
  height: number; // 0-10
  maritalStatus: number; // 0-10
  lifestyle: number; // 0-10
  family: number; // 0-10
}

export interface CompatibilityResult {
  candidate: MatrimonialProfile;
  totalScore: number; // 0 - 100
  label: 'Excellent Match' | 'Good Match' | 'Moderate Match' | 'Low Compatibility';
  scoreBreakdown: ScoreBreakdown;
  matchReason: string;
  strengths: string[];
  concerns: string[];
}

/**
  HARD ELIGIBILITY FILTER:
  Female client -> Male candidates only
  Male client -> Female candidates only
*/
export function filterEligibleCandidates(client: MatrimonialProfile, pool: MatrimonialProfile[]): MatrimonialProfile[] {
  const targetGender = client.gender === 'Female' ? 'Male' : 'Female';
  return pool.filter(p => p.id !== client.id && p.gender === targetGender);
}

export function calculateDeterministicCompatibility(
  client: MatrimonialProfile,
  candidate: MatrimonialProfile
): CompatibilityResult {
  // Enforce Hard Eligibility Filter
  if (client.gender === candidate.gender) {
    throw new Error(`Gender mismatch: ${client.firstName} (${client.gender}) cannot match with ${candidate.firstName} (${candidate.gender}).`);
  }

  const prefs = client.preferences;

  // 1. AGE (0-10)
  let ageScore = 5;
  if (candidate.age >= prefs.ageMin && candidate.age <= prefs.ageMax) {
    ageScore = 10;
  } else {
    const diff = Math.min(Math.abs(candidate.age - prefs.ageMin), Math.abs(candidate.age - prefs.ageMax));
    ageScore = Math.max(0, 10 - diff * 2);
  }

  // 2. LOCATION (0-10)
  let locationScore = 4;
  if (client.city.toLowerCase() === candidate.city.toLowerCase()) {
    locationScore = 10;
  } else if (prefs.locations.some(loc => loc.toLowerCase() === candidate.city.toLowerCase() || loc.includes('Anywhere'))) {
    locationScore = 8.5;
  } else if (client.state.toLowerCase() === candidate.state.toLowerCase()) {
    locationScore = 6;
  }

  // 3. RELIGION (0-10)
  let religionScore = 0;
  if (client.religion === candidate.religion) {
    religionScore = 10;
  } else if (prefs.religions.includes('Any') || prefs.religions.includes(candidate.religion)) {
    religionScore = 8;
  } else {
    religionScore = 0;
  }

  // 4. JAIN PREFERENCE & SECT (0-10)
  let jainScore = 10;
  if (client.religion === 'Jain' || candidate.religion === 'Jain') {
    const jPref = prefs.jainPreference || 'Open to both';
    if (jPref === 'Jain only' && candidate.religion !== 'Jain') {
      jainScore = 0;
    } else if (jPref === 'Non-Jain only' && candidate.religion === 'Jain') {
      jainScore = 0;
    } else if (client.religion === 'Jain' && candidate.religion === 'Jain') {
      if (client.jainSect && candidate.jainSect) {
        if (client.jainSect === candidate.jainSect) {
          jainScore = 10;
        } else if (prefs.jainSect === 'Any' || !prefs.jainSect) {
          jainScore = 8;
        } else {
          jainScore = 6;
        }
      } else {
        jainScore = 9;
      }
    } else {
      jainScore = 7;
    }
  }

  // 5. CASTE & SUB-CASTE (0-10)
  let casteScore = 5;
  if (client.caste === candidate.caste) {
    casteScore = 10;
    if (client.subCaste && candidate.subCaste && client.subCaste === candidate.subCaste) {
      casteScore = 10;
    }
  } else if (prefs.castes.includes('Any') || prefs.castes.includes('Open') || prefs.castes.includes(candidate.caste)) {
    casteScore = 8;
  } else {
    casteScore = 2;
  }

  // 6. OCCUPATION (0-10)
  let occupationScore = 6;
  const prefOcc = prefs.preferredOccupation.toLowerCase();
  const candOcc = (candidate.profession.designation + ' ' + candidate.profession.industry).toLowerCase();
  if (prefOcc.includes('any') || prefOcc.includes('professional')) {
    occupationScore = 8.5;
  } else {
    const keywords = prefOcc.split('/').map(s => s.trim());
    const matched = keywords.some(k => candOcc.includes(k.toLowerCase()));
    occupationScore = matched ? 10 : 5;
  }

  // 7. EDUCATION (0-10)
  let educationScore = 6;
  const prefEdu = prefs.preferredEducation.toLowerCase();
  const candDegree = (candidate.education.degree + ' ' + (candidate.education.postgradDegree || '')).toLowerCase();
  if (candDegree.includes('m.') || candDegree.includes('ca') || candDegree.includes('mba') || candDegree.includes('md') || candDegree.includes('phd')) {
    educationScore = 9.5;
  } else if (prefEdu.includes('any')) {
    educationScore = 8;
  } else {
    educationScore = 7;
  }

  // 8. INCOME (0-10)
  let incomeScore = 5;
  if (candidate.profession.income >= prefs.preferredIncomeMin) {
    incomeScore = 10;
  } else {
    const ratio = candidate.profession.income / Math.max(1, prefs.preferredIncomeMin);
    incomeScore = Math.max(2, Math.round(10 * ratio));
  }

  // 9. HEIGHT (0-10)
  let heightScore = 5;
  if (candidate.height >= prefs.heightMin && candidate.height <= prefs.heightMax) {
    heightScore = 10;
  } else {
    const diff = Math.min(Math.abs(candidate.height - prefs.heightMin), Math.abs(candidate.height - prefs.heightMax));
    heightScore = Math.max(0, 10 - diff * 1.5);
  }

  // 10. MARITAL STATUS (0-10)
  let maritalScore = 0;
  if (prefs.preferredMaritalStatus === 'Any' || prefs.preferredMaritalStatus === candidate.maritalStatus) {
    maritalScore = 10;
  } else {
    maritalScore = 0;
  }

  // 11. LIFESTYLE & DIET (0-10)
  let lifestyleScore = 0;
  if (client.lifestyle.diet === candidate.lifestyle.diet) {
    lifestyleScore += 5;
  } else if (client.lifestyle.diet === 'Jain Vegetarian' && candidate.lifestyle.diet === 'Vegetarian') {
    lifestyleScore += 3;
  } else {
    lifestyleScore += 1;
  }
  if (client.lifestyle.smoking === candidate.lifestyle.smoking) lifestyleScore += 2.5;
  if (client.lifestyle.drinking === candidate.lifestyle.drinking) lifestyleScore += 2.5;
  lifestyleScore = Math.min(10, Math.round(lifestyleScore));

  // 12. FAMILY VALUES (0-10)
  let familyScore = 6;
  if (client.family.familyValues === candidate.family.familyValues) {
    familyScore = 10;
  } else {
    familyScore = 6.5;
  }

  const scoreBreakdown: ScoreBreakdown = {
    age: Math.round(ageScore),
    location: Math.round(locationScore),
    religion: Math.round(religionScore),
    jainPreference: Math.round(jainScore),
    caste: Math.round(casteScore),
    occupation: Math.round(occupationScore),
    education: Math.round(educationScore),
    income: Math.round(incomeScore),
    height: Math.round(heightScore),
    maritalStatus: Math.round(maritalScore),
    lifestyle: Math.round(lifestyleScore),
    family: Math.round(familyScore)
  };

  // Raw weighted sum out of 120, scaled to 100
  const rawSum = Object.values(scoreBreakdown).reduce((acc, val) => acc + val, 0);
  const totalScore = Math.round((rawSum / 120) * 100);

  let label: 'Excellent Match' | 'Good Match' | 'Moderate Match' | 'Low Compatibility' = 'Low Compatibility';
  if (totalScore >= 85) label = 'Excellent Match';
  else if (totalScore >= 70) label = 'Good Match';
  else if (totalScore >= 55) label = 'Moderate Match';

  // Build bulleted strengths & concerns
  const strengths: string[] = [];
  const concerns: string[] = [];

  if (scoreBreakdown.age >= 9) strengths.push(`Age (${candidate.age} yrs) aligns perfectly with preferred range (${prefs.ageMin}–${prefs.ageMax} yrs)`);
  if (scoreBreakdown.location >= 8) strengths.push(`Location alignment: ${candidate.city} is highly preferred`);
  else concerns.push(`Location mismatch: candidate lives in ${candidate.city}`);

  if (scoreBreakdown.religion >= 9 && scoreBreakdown.jainPreference >= 8) {
    strengths.push(`Strong religious & sect compatibility (${candidate.religion}${candidate.jainSect ? ' - ' + candidate.jainSect : ''})`);
  } else if (scoreBreakdown.jainPreference < 6) {
    concerns.push(`Sect/Diet difference: client prefers ${prefs.jainPreference || 'Jain only'}`);
  }

  if (scoreBreakdown.education >= 9) strengths.push(`High academic alignment (${candidate.education.degree})`);
  if (scoreBreakdown.income >= 9) strengths.push(`Financial stability meets target income (₹${candidate.profession.income} LPA)`);

  const matchReason = strengths.length > 0
    ? `${strengths.slice(0, 2).join('. ')}.`
    : `Moderate overall alignment across profile attributes.`;

  return {
    candidate,
    totalScore,
    label,
    scoreBreakdown,
    matchReason,
    strengths,
    concerns
  };
}

export function getRankedMatches(
  client: MatrimonialProfile,
  pool: MatrimonialProfile[]
): CompatibilityResult[] {
  const eligible = filterEligibleCandidates(client, pool);
  return eligible
    .map(candidate => calculateDeterministicCompatibility(client, candidate))
    .sort((a, b) => b.totalScore - a.totalScore);
}
