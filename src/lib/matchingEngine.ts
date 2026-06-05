import { Customer, MatchRecommendation } from '../types/matchmaker';

export function calculateCompatibility(client: Customer, prospect: Customer): Omit<MatchRecommendation, 'aiExplanation' | 'aiIntroduction'> {
  // Genders must be opposite in this standard heterosexual CRM matchmaking pool
  if (client.gender === prospect.gender) {
    return {
      profile: prospect,
      score: 0,
      scoreBreakdown: {
        age: 0,
        education: 0,
        career: 0,
        religion: 0,
        family: 0,
        lifestyle: 0,
        relocation: 0,
        children: 0
      }
    };
  }

  // 1. AGE COMPATIBILITY (15 points)
  let ageScore = 0;
  const inRange = prospect.age >= client.preferences.ageMin && prospect.age <= client.preferences.ageMax;
  
  if (client.gender === 'Male') {
    // Male client matching logic: Prefers younger matches
    if (prospect.age < client.age) {
      ageScore = 15; // Younger is preferred
    } else if (prospect.age === client.age) {
      ageScore = 12; // Same age is good
    } else {
      // Older: penalize based on difference
      const diff = prospect.age - client.age;
      ageScore = Math.max(0, 10 - diff * 3);
    }
  } else {
    // Female client matching logic: Prefers older/same-age matches (stability indicators)
    if (prospect.age > client.age) {
      ageScore = 15; // Older is preferred for stability
    } else if (prospect.age === client.age) {
      ageScore = 13; // Same age is good
    } else {
      // Younger: penalize based on difference
      const diff = client.age - prospect.age;
      ageScore = Math.max(0, 8 - diff * 2);
    }
  }
  // Ensure that if it satisfies the explicit preference range, it gets at least some base points
  if (inRange) {
    ageScore = Math.max(ageScore, 10);
  }

  // 2. EDUCATION COMPATIBILITY (15 points)
  let educationScore = 8; // base for both having degree
  const clientHasPG = !!client.education.postgradDegree;
  const prospectHasPG = !!prospect.education.postgradDegree;
  
  if (clientHasPG && prospectHasPG) {
    educationScore = 15; // High postgrad alignment
  } else if (clientHasPG || prospectHasPG) {
    educationScore = 11; // One PG, one UG
  } else {
    educationScore = 8; // Both UG
  }
  
  // Bonus if degrees match field (e.g. both B.Tech/M.Tech or both medical degrees)
  const isTechClient = client.education.degree.includes('Tech') || client.education.degree.includes('E.');
  const isTechProspect = prospect.education.degree.includes('Tech') || prospect.education.degree.includes('E.');
  const isMedClient = client.education.degree.includes('MBBS') || client.education.degree.includes('MD') || client.education.degree.includes('BDS');
  const isMedProspect = prospect.education.degree.includes('MBBS') || prospect.education.degree.includes('MD') || prospect.education.degree.includes('BDS');
  
  if ((isTechClient && isTechProspect) || (isMedClient && isMedProspect)) {
    educationScore = Math.min(15, educationScore + 2);
  }

  // 3. CAREER & STABILITY COMPATIBILITY (15 points)
  let careerScore = 0;
  
  if (client.gender === 'Female') {
    // Female matching logic: Focuses on professional compatibility & stability indicators
    // Prefer partner earning equal or higher income
    if (prospect.profession.income >= client.profession.income) {
      careerScore = 12;
      // Extra points for higher income bracket (stability indicator)
      if (prospect.profession.income >= client.profession.income * 1.5) {
        careerScore = 15;
      }
    } else {
      // Prospect earns less: scale down
      const diffRatio = prospect.profession.income / client.profession.income;
      careerScore = Math.max(2, Math.round(10 * diffRatio));
    }
  } else {
    // Male matching logic: Prefers compatible levels, less emphasis on earning more
    const incomeDiff = Math.abs(client.profession.income - prospect.profession.income);
    if (incomeDiff < 10) {
      careerScore = 15;
    } else if (prospect.profession.income <= client.profession.income) {
      careerScore = 13;
    } else {
      // Prospect earns much more, still very fine
      careerScore = 11;
    }
  }

  // Bonus for similar professional status (designations) or compatible industries
  if (client.profession.industry === prospect.profession.industry) {
    careerScore = Math.min(15, careerScore + 2);
  }

  // 4. RELIGION & CASTE COMPATIBILITY (15 points)
  let religionScore = 0;
  const isReligionMatch = client.preferences.religions.includes(prospect.religion);
  
  if (isReligionMatch) {
    religionScore = 10;
    if (client.religion === prospect.religion) {
      religionScore = 12; // Exact same religion is preferred
    }
  } else {
    religionScore = 0; // Conflicting religion preferences
  }

  let casteScore = 0;
  const prefersAnyCaste = client.preferences.castes.includes('Any') || client.preferences.castes.includes('Open');
  const isCasteMatch = client.preferences.castes.includes(prospect.caste);
  
  if (prefersAnyCaste) {
    casteScore = 3;
  } else if (isCasteMatch || client.caste === prospect.caste) {
    casteScore = 3;
  } else {
    casteScore = 0;
  }
  
  const totalReligionScore = religionScore + casteScore;

  // 5. FAMILY VALUES COMPATIBILITY (10 points)
  let familyScore = 0;
  // If family types match (Nuclear/Joint), they align
  if (client.family.familyType === prospect.family.familyType) {
    familyScore = 10;
  } else {
    familyScore = 6; // Slight mismatch but usually acceptable
  }

  // 6. LIFESTYLE COMPATIBILITY (10 points)
  let lifestylePoints = 0;
  
  // Diet overlap
  if (client.lifestyle.diet === prospect.lifestyle.diet) {
    lifestylePoints += 4;
  } else if (client.lifestyle.diet === 'Vegetarian' && prospect.lifestyle.diet === 'Non-Vegetarian') {
    // Mismatch: Vegetarian preferences are often strict in India
    lifestylePoints += 0;
  } else {
    lifestylePoints += 2; // Eggetarian/Vegetarian or Non-Veg/Eggetarian
  }
  
  // Smoking
  if (client.lifestyle.smoking === prospect.lifestyle.smoking) {
    lifestylePoints += 3;
  } else if (client.lifestyle.smoking === 'No' && prospect.lifestyle.smoking === 'Yes') {
    lifestylePoints += 0;
  } else {
    lifestylePoints += 1.5;
  }
  
  // Drinking
  if (client.lifestyle.drinking === prospect.lifestyle.drinking) {
    lifestylePoints += 3;
  } else if (client.lifestyle.drinking === 'No' && prospect.lifestyle.drinking === 'Yes') {
    lifestylePoints += 0;
  } else {
    lifestylePoints += 1.5;
  }
  
  // Pets (bonus if they both like pets)
  if (client.lifestyle.openToPets === prospect.lifestyle.openToPets) {
    lifestylePoints = Math.min(10, lifestylePoints + 1);
  }
  
  const totalLifestyleScore = Math.round(lifestylePoints);

  // 7. RELOCATION & LOCATION COMPATIBILITY (10 points)
  let relocationScore = 0;
  const isSameCity = client.city === prospect.city;
  const isProspectCityPreferred = client.preferences.locations.includes(prospect.city);
  
  if (isSameCity) {
    relocationScore = 7;
  } else if (isProspectCityPreferred) {
    relocationScore = 6;
  } else {
    relocationScore = 3;
  }
  
  // Relocation open status alignment
  // If client is willing to relocate or prospect is willing to relocate
  const clientWilling = client.preferences.openToRelocate === 'Yes' || client.preferences.openToRelocate === 'Depends';
  const prospectWilling = prospect.preferences.openToRelocate === 'Yes' || prospect.preferences.openToRelocate === 'Depends';
  
  if (isSameCity) {
    relocationScore += 3; // No relocation needed
  } else if (clientWilling && prospectWilling) {
    relocationScore += 3; // Both flexible
  } else if (clientWilling || prospectWilling) {
    relocationScore += 2; // One flexible
  } else {
    relocationScore += 0; // Mismatch
  }

  // 8. CHILDREN PREFERENCE COMPATIBILITY (10 points)
  let childrenScore = 0;
  if (client.preferences.wantKids === prospect.preferences.wantKids) {
    childrenScore = 10;
  } else if (client.preferences.wantKids === 'Open' || prospect.preferences.wantKids === 'Open') {
    childrenScore = 7; // Open to negotiation
  } else {
    childrenScore = 0; // Explicit mismatch (Yes vs No)
  }

  // MALE SPECIFIC ADDITIONS (Height prefers shorter)
  if (client.gender === 'Male' && prospect.gender === 'Female') {
    // Height check: Male client prefers shorter partner
    if (prospect.height <= client.height) {
      // perfectly fine height
    } else {
      // female is taller: small traditional penalty (max 2 points off the overall score)
      const heightDiff = prospect.height - client.height;
      const penalty = Math.min(3, heightDiff * 0.5);
      ageScore = Math.max(0, ageScore - penalty);
    }
  }

  // FEMALE SPECIFIC ADDITIONS (Height prefers taller)
  if (client.gender === 'Female' && prospect.gender === 'Male') {
    // Height check: Female client prefers taller partner
    if (prospect.height >= client.height) {
      // perfectly fine height
    } else {
      // male is shorter: small traditional penalty (max 3 points off the overall score)
      const heightDiff = client.height - prospect.height;
      const penalty = Math.min(4, heightDiff * 0.7);
      careerScore = Math.max(0, careerScore - penalty);
    }
  }

  const scoreBreakdown = {
    age: Math.round(ageScore),
    education: Math.round(educationScore),
    career: Math.round(careerScore),
    religion: Math.round(totalReligionScore),
    family: Math.round(familyScore),
    lifestyle: Math.round(totalLifestyleScore),
    relocation: Math.round(relocationScore),
    children: Math.round(childrenScore)
  };

  const totalScore = Math.min(
    100,
    Math.max(
      0,
      scoreBreakdown.age +
        scoreBreakdown.education +
        scoreBreakdown.career +
        scoreBreakdown.religion +
        scoreBreakdown.family +
        scoreBreakdown.lifestyle +
        scoreBreakdown.relocation +
        scoreBreakdown.children
    )
  );

  return {
    profile: prospect,
    score: totalScore,
    scoreBreakdown
  };
}

export function getTopMatches(client: Customer, pool: Customer[], limit = 10): Omit<MatchRecommendation, 'aiExplanation' | 'aiIntroduction'>[] {
  // Filters for opposite gender
  const oppositeGenderPool = pool.filter(p => p.gender !== client.gender && p.id !== client.id);
  
  // Map to scores and sort
  const recommendations = oppositeGenderPool
    .map(p => calculateCompatibility(client, p))
    .sort((a, b) => b.score - a.score); // Highest score first
    
  return recommendations.slice(0, limit);
}
