import { Customer, MatchRecommendation } from '../types/matchmaker';

export function calculateCompatibility(client: Customer, prospect: Customer): Omit<MatchRecommendation, 'aiExplanation' | 'aiIntroduction'> {
  // Hard Filter: Genders must be opposite in standard heterosexual matchmaking pool
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
  const ageMin = client.preferences?.ageMin ?? 18;
  const ageMax = client.preferences?.ageMax ?? 70;
  const inRange = prospect.age >= ageMin && prospect.age <= ageMax;
  
  if (client.gender === 'Male') {
    // Male client matching logic: Prefers younger matches
    if (prospect.age < client.age) {
      ageScore = 15;
    } else if (prospect.age === client.age) {
      ageScore = 12;
    } else {
      const diff = prospect.age - client.age;
      ageScore = Math.max(0, 10 - diff * 3);
    }
  } else {
    // Female client matching logic: Prefers older/same-age matches
    if (prospect.age > client.age) {
      ageScore = 15;
    } else if (prospect.age === client.age) {
      ageScore = 13;
    } else {
      const diff = client.age - prospect.age;
      ageScore = Math.max(0, 8 - diff * 2);
    }
  }
  if (inRange) {
    ageScore = Math.max(ageScore, 10);
  }

  // 2. EDUCATION COMPATIBILITY (15 points)
  let educationScore = 8;
  const clientHasPG = !!client.education.postgradDegree;
  const prospectHasPG = !!prospect.education.postgradDegree;
  
  if (clientHasPG && prospectHasPG) {
    educationScore = 15;
  } else if (clientHasPG || prospectHasPG) {
    educationScore = 11;
  } else {
    educationScore = 8;
  }
  
  const isTechClient = (client.education.degree || '').includes('Tech') || (client.education.degree || '').includes('E.');
  const isTechProspect = (prospect.education.degree || '').includes('Tech') || (prospect.education.degree || '').includes('E.');
  const isMedClient = (client.education.degree || '').includes('MBBS') || (client.education.degree || '').includes('MD') || (client.education.degree || '').includes('BDS');
  const isMedProspect = (prospect.education.degree || '').includes('MBBS') || (prospect.education.degree || '').includes('MD') || (prospect.education.degree || '').includes('BDS');
  
  if ((isTechClient && isTechProspect) || (isMedClient && isMedProspect)) {
    educationScore = Math.min(15, educationScore + 2);
  }

  // 3. CAREER & STABILITY COMPATIBILITY (15 points)
  let careerScore = 0;
  if (client.gender === 'Female') {
    if (prospect.profession.income >= client.profession.income) {
      careerScore = 12;
      if (prospect.profession.income >= client.profession.income * 1.5) {
        careerScore = 15;
      }
    } else {
      const diffRatio = client.profession.income > 0 ? prospect.profession.income / client.profession.income : 1;
      careerScore = Math.max(2, Math.round(10 * diffRatio));
    }
  } else {
    const incomeDiff = Math.abs(client.profession.income - prospect.profession.income);
    if (incomeDiff < 10) {
      careerScore = 15;
    } else if (prospect.profession.income <= client.profession.income) {
      careerScore = 13;
    } else {
      careerScore = 11;
    }
  }

  if (client.profession.industry === prospect.profession.industry) {
    careerScore = Math.min(15, careerScore + 2);
  }

  // 4. RELIGION & CASTE COMPATIBILITY (15 points)
  let religionScore = 0;
  const preferredReligions = client.preferences?.religions || [];
  const isReligionMatch = preferredReligions.length === 0 || preferredReligions.includes(prospect.religion);
  
  if (isReligionMatch) {
    religionScore = 10;
    if (client.religion === prospect.religion) {
      religionScore = 12;
    }
  } else {
    religionScore = 0;
  }

  let casteScore = 0;
  const preferredCastes = client.preferences?.castes || ['Any'];
  const prefersAnyCaste = preferredCastes.includes('Any') || preferredCastes.includes('Open');
  const isCasteMatch = preferredCastes.includes(prospect.caste);
  
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
  if (client.family.familyType === prospect.family.familyType) {
    familyScore = 10;
  } else {
    familyScore = 6;
  }

  // 6. LIFESTYLE COMPATIBILITY (10 points)
  let lifestylePoints = 0;
  if (client.lifestyle.diet === prospect.lifestyle.diet) {
    lifestylePoints += 4;
  } else if (client.lifestyle.diet === 'Vegetarian' && prospect.lifestyle.diet === 'Non-Vegetarian') {
    lifestylePoints += 0;
  } else {
    lifestylePoints += 2;
  }
  
  if (client.lifestyle.smoking === prospect.lifestyle.smoking) {
    lifestylePoints += 3;
  } else if (client.lifestyle.smoking === 'No' && prospect.lifestyle.smoking === 'Yes') {
    lifestylePoints += 0;
  } else {
    lifestylePoints += 1.5;
  }
  
  if (client.lifestyle.drinking === prospect.lifestyle.drinking) {
    lifestylePoints += 3;
  } else if (client.lifestyle.drinking === 'No' && prospect.lifestyle.drinking === 'Yes') {
    lifestylePoints += 0;
  } else {
    lifestylePoints += 1.5;
  }
  
  if (client.lifestyle.openToPets === prospect.lifestyle.openToPets) {
    lifestylePoints = Math.min(10, lifestylePoints + 1);
  }
  
  const totalLifestyleScore = Math.round(lifestylePoints);

  // 7. RELOCATION & LOCATION COMPATIBILITY (10 points)
  let relocationScore = 0;
  const preferredLocations = client.preferences?.locations || [];
  const isSameCity = client.city === prospect.city;
  const isProspectCityPreferred = preferredLocations.includes(prospect.city);
  
  if (isSameCity) {
    relocationScore = 7;
  } else if (isProspectCityPreferred) {
    relocationScore = 6;
  } else {
    relocationScore = 3;
  }
  
  const clientWilling = client.preferences?.openToRelocate === 'Yes' || client.preferences?.openToRelocate === 'Depends';
  const prospectWilling = prospect.preferences?.openToRelocate === 'Yes' || prospect.preferences?.openToRelocate === 'Depends';
  
  if (isSameCity) {
    relocationScore += 3;
  } else if (clientWilling && prospectWilling) {
    relocationScore += 3;
  } else if (clientWilling || prospectWilling) {
    relocationScore += 2;
  } else {
    relocationScore += 0;
  }

  // 8. CHILDREN PREFERENCE COMPATIBILITY (10 points)
  let childrenScore = 0;
  const clientWantKids = client.preferences?.wantKids || 'Open';
  const prospectWantKids = prospect.preferences?.wantKids || 'Open';
  if (clientWantKids === prospectWantKids) {
    childrenScore = 10;
  } else if (clientWantKids === 'Open' || prospectWantKids === 'Open') {
    childrenScore = 7;
  } else {
    childrenScore = 0;
  }

  // Height heuristic logic
  if (client.gender === 'Male' && prospect.gender === 'Female') {
    if (prospect.height > client.height) {
      const heightDiff = prospect.height - client.height;
      const penalty = Math.min(3, heightDiff * 0.5);
      ageScore = Math.max(0, ageScore - penalty);
    }
  }

  if (client.gender === 'Female' && prospect.gender === 'Male') {
    if (prospect.height < client.height) {
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
  // Server-side strict opposite gender filtering
  const oppositeGenderPool = pool.filter(p => p.gender !== client.gender && p.id !== client.id);
  
  const recommendations = oppositeGenderPool
    .map(p => calculateCompatibility(client, p))
    .sort((a, b) => b.score - a.score);
    
  return recommendations.slice(0, limit);
}
