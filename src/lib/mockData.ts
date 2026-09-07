export interface EducationInfo {
  undergradCollege: string;
  degree: string;
  postgradDegree?: string;
}

export interface ProfessionalInfo {
  company: string;
  designation: string;
  income: number; // in LPA
  industry: string;
}

export interface FamilyInfo {
  siblings: number;
  familyType: 'Joint' | 'Nuclear';
  familyValues: 'Traditional' | 'Moderate' | 'Liberal';
  fatherOccupation: string;
  motherOccupation: string;
}

export interface LifestyleInfo {
  smoking: 'Never' | 'Occasionally' | 'Regular';
  drinking: 'Never' | 'Occasionally' | 'Regular';
  diet: 'Vegetarian' | 'Jain Vegetarian' | 'Eggetarian' | 'Non-Vegetarian';
  openToPets: boolean;
  hobbies: string[];
}

export interface DetailedPreferences {
  preferredGender: 'Male' | 'Female';
  ageMin: number;
  ageMax: number;
  locations: string[]; // e.g. ['Mumbai', 'Pune', 'Anywhere in India']
  religions: string[]; // e.g. ['Jain', 'Hindu', 'Any']
  jainPreference?: 'Jain only' | 'Non-Jain only' | 'Jain preferred' | 'Open to both';
  jainSect?: 'Shwetambar' | 'Digambar' | 'Any';
  castes: string[];
  subCaste?: string;
  preferredOccupation: string;
  preferredEducation: string;
  preferredIncomeMin: number; // LPA
  preferredIncomeMax?: number;
  heightMin: number; // in cm
  heightMax: number; // in cm
  preferredMaritalStatus: 'Never Married' | 'Divorced' | 'Widowed' | 'Any';
  preferredDiet: 'Vegetarian' | 'Jain Vegetarian' | 'Eggetarian' | 'Non-Vegetarian' | 'No Preference';
  preferredLifestyle?: string;
}

export interface MatrimonialProfile {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female';
  dob: string;
  age: number;
  city: string;
  state: string;
  country: string;
  height: number; // in cm (e.g., 165cm = 5'5")
  photoUrl: string;
  aboutMe: string;
  religion: 'Hindu' | 'Jain' | 'Sikh' | 'Muslim' | 'Christian' | 'Other';
  jainSect?: 'Shwetambar' | 'Digambar' | 'N/A';
  caste: string;
  subCaste?: string;
  motherTongue: string;
  languagesKnown: string[];
  maritalStatus: 'Never Married' | 'Divorced' | 'Widowed';
  manglik: 'Non-Manglik' | 'Manglik' | 'Anshik' | 'Don\'t Know';
  education: EducationInfo;
  profession: ProfessionalInfo;
  family: FamilyInfo;
  lifestyle: LifestyleInfo;
  preferences: DetailedPreferences;
  journeyStatus: 'New Lead' | 'Profile Pending' | 'Profile Verified' | 'Preferences Confirmed' | 'Matching' | 'Match Suggested' | 'Interest Sent' | 'Connection' | 'Closed';
  profileCompletion: number; // percentage
  verified: boolean;
  email?: string;
  phone?: string;
  lastContacted: string; // ISO or date string
  notes: { id: string; author: string; content: string; createdAt: string }[];
  timeline: { id: string; title: string; description: string; createdAt: string }[];
}

export const MOCK_PROFILES: MatrimonialProfile[] = [
  // 1. Riya Sharma (Female, 27, Mumbai, Jain Shwetambar)
  {
    id: 'client-1',
    firstName: 'Riya',
    lastName: 'Sharma',
    gender: 'Female',
    dob: '1997-04-12',
    age: 27,
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    height: 165, // 5'5"
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    aboutMe: 'Passionate Senior Product Designer at a leading fintech startup in Mumbai. Raised in a modern Jain family with deep cultural values. Enjoys classical music, weekend travels, and culinary experiments.',
    religion: 'Jain',
    jainSect: 'Shwetambar',
    caste: 'Oswal',
    subCaste: 'Visa Oswal',
    motherTongue: 'Gujarati',
    languagesKnown: ['English', 'Gujarati', 'Hindi'],
    maritalStatus: 'Never Married',
    manglik: 'Non-Manglik',
    education: {
      undergradCollege: 'IIT Bombay',
      degree: 'B.Tech in Design',
      postgradDegree: 'M.Des Industrial Design'
    },
    profession: {
      company: 'Razorpay',
      designation: 'Lead UX Designer',
      income: 28,
      industry: 'Technology / Fintech'
    },
    family: {
      siblings: 1,
      familyType: 'Nuclear',
      familyValues: 'Moderate',
      fatherOccupation: 'Chartered Accountant (Business)',
      motherOccupation: 'Homemaker'
    },
    lifestyle: {
      smoking: 'Never',
      drinking: 'Never',
      diet: 'Jain Vegetarian',
      openToPets: false,
      hobbies: ['Design', 'Pottery', 'Badminton', 'Traveling']
    },
    preferences: {
      preferredGender: 'Male',
      ageMin: 27,
      ageMax: 32,
      locations: ['Mumbai', 'Pune', 'Bangalore'],
      religions: ['Jain'],
      jainPreference: 'Jain preferred',
      jainSect: 'Shwetambar',
      castes: ['Oswal', 'Porwal', 'Any Jain'],
      preferredOccupation: 'Software Engineer / Product / Finance / Entrepreneur',
      preferredEducation: 'Master\'s / B.Tech / MBA',
      preferredIncomeMin: 25,
      heightMin: 172, // 5'8"
      heightMax: 188,
      preferredMaritalStatus: 'Never Married',
      preferredDiet: 'Jain Vegetarian'
    },
    journeyStatus: 'Matching',
    profileCompletion: 96,
    verified: true,
    lastContacted: '2026-09-06T14:30:00Z',
    notes: [
      { id: 'n1', author: 'Matchmaker Maya', content: 'Spoke with family on Monday. Very particular about Jain vegetarian lifestyle and settled career in Mumbai/Pune.', createdAt: '2026-09-05T10:00:00Z' }
    ],
    timeline: [
      { id: 't1', title: 'Profile Verified', description: 'ID & Educational credentials verified by Matchmaker', createdAt: '2026-09-01T09:00:00Z' },
      { id: 't2', title: 'Preferences Confirmed', description: 'Detailed partner criteria locked in CRM', createdAt: '2026-09-03T11:00:00Z' }
    ]
  },

  // 2. Arjun Mehta (Male, 29, Mumbai, Jain Shwetambar) - Excellent match for Riya!
  {
    id: 'client-2',
    firstName: 'Arjun',
    lastName: 'Mehta',
    gender: 'Male',
    dob: '1995-08-20',
    age: 29,
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    height: 178, // 5'10"
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    aboutMe: 'Software Engineering Manager at a Series-B Tech Company. Balanced mindset, fitness enthusiast, and respectful of traditional values.',
    religion: 'Jain',
    jainSect: 'Shwetambar',
    caste: 'Oswal',
    subCaste: 'Dasa Oswal',
    motherTongue: 'Gujarati',
    languagesKnown: ['English', 'Hindi', 'Gujarati'],
    maritalStatus: 'Never Married',
    manglik: 'Non-Manglik',
    education: {
      undergradCollege: 'VJTI Mumbai',
      degree: 'B.E. Computer Science',
      postgradDegree: 'M.S. Software Systems'
    },
    profession: {
      company: 'BrowserStack',
      designation: 'Engineering Manager',
      income: 38,
      industry: 'Information Technology'
    },
    family: {
      siblings: 1,
      familyType: 'Nuclear',
      familyValues: 'Moderate',
      fatherOccupation: 'Textile Business Owner',
      motherOccupation: 'Teacher'
    },
    lifestyle: {
      smoking: 'Never',
      drinking: 'Never',
      diet: 'Jain Vegetarian',
      openToPets: false,
      hobbies: ['Running', 'Chess', 'Investing', 'Reading']
    },
    preferences: {
      preferredGender: 'Female',
      ageMin: 25,
      ageMax: 29,
      locations: ['Mumbai', 'Pune'],
      religions: ['Jain'],
      jainPreference: 'Jain preferred',
      jainSect: 'Shwetambar',
      castes: ['Oswal', 'Porwal', 'Any Jain'],
      preferredOccupation: 'Product Manager / Designer / Engineer / CA',
      preferredEducation: 'Bachelor\'s or Master\'s',
      preferredIncomeMin: 15,
      heightMin: 160,
      heightMax: 175,
      preferredMaritalStatus: 'Never Married',
      preferredDiet: 'Jain Vegetarian'
    },
    journeyStatus: 'Match Suggested',
    profileCompletion: 98,
    verified: true,
    lastContacted: '2026-09-06T16:00:00Z',
    notes: [
      { id: 'n2', author: 'Matchmaker Maya', content: 'Shortlisted Riya Sharma. Family reviewed Riya\'s profile and expressed strong initial interest.', createdAt: '2026-09-06T15:00:00Z' }
    ],
    timeline: [
      { id: 't3', title: 'Match Suggested', description: 'Suggested Riya Sharma (92% Compatibility)', createdAt: '2026-09-06T15:30:00Z' }
    ]
  },

  // 3. Meera Shah (Female, 26, Ahmedabad, Jain Digambar)
  {
    id: 'client-3',
    firstName: 'Meera',
    lastName: 'Shah',
    gender: 'Female',
    dob: '1998-01-15',
    age: 26,
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    height: 162, // 5'4"
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    aboutMe: 'Chartered Accountant practicing independently with my father\'s consultancy firm in Ahmedabad. Value humility, family warmth, and academic excellence.',
    religion: 'Jain',
    jainSect: 'Digambar',
    caste: 'Shah',
    motherTongue: 'Gujarati',
    languagesKnown: ['English', 'Gujarati', 'Hindi'],
    maritalStatus: 'Never Married',
    manglik: 'Non-Manglik',
    education: {
      undergradCollege: 'HL College of Commerce',
      degree: 'B.Com',
      postgradDegree: 'CA (ICAI)'
    },
    profession: {
      company: 'Shah & Associates CA Firm',
      designation: 'Senior Partner & Consultant',
      income: 22,
      industry: 'Accounting / Finance'
    },
    family: {
      siblings: 2,
      familyType: 'Joint',
      familyValues: 'Traditional',
      fatherOccupation: 'Senior Chartered Accountant',
      motherOccupation: 'Homemaker'
    },
    lifestyle: {
      smoking: 'Never',
      drinking: 'Never',
      diet: 'Jain Vegetarian',
      openToPets: false,
      hobbies: ['Yoga', 'Financial Analytics', 'Gardening']
    },
    preferences: {
      preferredGender: 'Male',
      ageMin: 27,
      ageMax: 31,
      locations: ['Ahmedabad', 'Mumbai', 'Surat'],
      religions: ['Jain'],
      jainPreference: 'Jain only',
      jainSect: 'Digambar',
      castes: ['Shah', 'Any Jain'],
      preferredOccupation: 'Chartered Accountant / Business Owner / Finance',
      preferredEducation: 'CA / MBA / Engineering',
      preferredIncomeMin: 20,
      heightMin: 170,
      heightMax: 185,
      preferredMaritalStatus: 'Never Married',
      preferredDiet: 'Jain Vegetarian'
    },
    journeyStatus: 'Preferences Confirmed',
    profileCompletion: 92,
    verified: true,
    lastContacted: '2026-09-04T12:00:00Z',
    notes: [],
    timeline: []
  },

  // 4. Kunal Jain (Male, 30, Bangalore, Jain Digambar) - Strong match for Meera!
  {
    id: 'client-4',
    firstName: 'Kunal',
    lastName: 'Jain',
    gender: 'Male',
    dob: '1994-11-05',
    age: 30,
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    height: 175, // 5'9"
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    aboutMe: 'Senior Product Manager at Flipkart Bangalore. Open to relocating back to Gujarat for family business expansion.',
    religion: 'Jain',
    jainSect: 'Digambar',
    caste: 'Jain',
    motherTongue: 'Hindi',
    languagesKnown: ['English', 'Hindi', 'Kannada'],
    maritalStatus: 'Never Married',
    manglik: 'Non-Manglik',
    education: {
      undergradCollege: 'NIT Trichy',
      degree: 'B.Tech',
      postgradDegree: 'MBA (IIM Kozhikode)'
    },
    profession: {
      company: 'Flipkart',
      designation: 'Senior Product Manager',
      income: 34,
      industry: 'E-commerce / Product'
    },
    family: {
      siblings: 1,
      familyType: 'Nuclear',
      familyValues: 'Moderate',
      fatherOccupation: 'Retired Government Officer',
      motherOccupation: 'Homemaker'
    },
    lifestyle: {
      smoking: 'Never',
      drinking: 'Never',
      diet: 'Jain Vegetarian',
      openToPets: false,
      hobbies: ['Tech Podcasts', 'Badminton', 'Trekking']
    },
    preferences: {
      preferredGender: 'Female',
      ageMin: 25,
      ageMax: 29,
      locations: ['Bangalore', 'Ahmedabad', 'Mumbai'],
      religions: ['Jain'],
      jainPreference: 'Jain only',
      jainSect: 'Digambar',
      castes: ['Any Jain'],
      preferredOccupation: 'CA / Finance / Product / Tech',
      preferredEducation: 'Bachelor\'s or Master\'s',
      preferredIncomeMin: 15,
      heightMin: 158,
      heightMax: 172,
      preferredMaritalStatus: 'Never Married',
      preferredDiet: 'Jain Vegetarian'
    },
    journeyStatus: 'Match Suggested',
    profileCompletion: 95,
    verified: true,
    lastContacted: '2026-09-05T18:00:00Z',
    notes: [],
    timeline: []
  },

  // 5. Sneha Patel (Female, 28, Delhi, Hindu Patidar)
  {
    id: 'client-5',
    firstName: 'Sneha',
    lastName: 'Patel',
    gender: 'Female',
    dob: '1996-03-30',
    age: 28,
    city: 'Delhi',
    state: 'Delhi NCR',
    country: 'India',
    height: 168, // 5'6"
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    aboutMe: 'Brand Marketing Lead at an FMCG MNC in Gurgaon. Upbeat, ambitious, loves coffee tasting, modern art, and weekend drives.',
    religion: 'Hindu',
    caste: 'Patidar',
    subCaste: 'Leva Patel',
    motherTongue: 'Gujarati',
    languagesKnown: ['English', 'Hindi', 'Gujarati'],
    maritalStatus: 'Never Married',
    manglik: 'Non-Manglik',
    education: {
      undergradCollege: 'Delhi University (SRCC)',
      degree: 'B.Com (Hons)',
      postgradDegree: 'MBA (MDI Gurgaon)'
    },
    profession: {
      company: 'Nestle India',
      designation: 'Senior Brand Manager',
      income: 26,
      industry: 'FMCG / Marketing'
    },
    family: {
      siblings: 1,
      familyType: 'Nuclear',
      familyValues: 'Liberal',
      fatherOccupation: 'Real Estate Developer',
      motherOccupation: 'Interior Designer'
    },
    lifestyle: {
      smoking: 'Never',
      drinking: 'Occasionally',
      diet: 'Vegetarian',
      openToPets: true,
      hobbies: ['Art', 'Pilates', 'Travel Vlogging']
    },
    preferences: {
      preferredGender: 'Male',
      ageMin: 28,
      ageMax: 33,
      locations: ['Delhi', 'Gurgaon', 'Mumbai'],
      religions: ['Hindu'],
      castes: ['Patidar', 'Open'],
      preferredOccupation: 'Corporate Executive / Consultant / Entrepreneur',
      preferredEducation: 'MBA / Engineering',
      preferredIncomeMin: 25,
      heightMin: 175,
      heightMax: 190,
      preferredMaritalStatus: 'Never Married',
      preferredDiet: 'Vegetarian'
    },
    journeyStatus: 'Interest Sent',
    profileCompletion: 94,
    verified: true,
    lastContacted: '2026-09-06T09:00:00Z',
    notes: [],
    timeline: []
  },

  // 6. Rohan Gupta (Male, 31, Mumbai, Hindu Agarwal)
  {
    id: 'client-6',
    firstName: 'Rohan',
    lastName: 'Gupta',
    gender: 'Male',
    dob: '1993-09-18',
    age: 31,
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    height: 180, // 5'11"
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
    aboutMe: 'Vice President at Global Investment Bank in BKC Mumbai. Avid marathoner, collector of rare vinyl records, and deeply family oriented.',
    religion: 'Hindu',
    caste: 'Agarwal',
    motherTongue: 'Hindi',
    languagesKnown: ['English', 'Hindi'],
    maritalStatus: 'Never Married',
    manglik: 'Non-Manglik',
    education: {
      undergradCollege: 'IIT Delhi',
      degree: 'B.Tech Electrical',
      postgradDegree: 'MBA (IIM Ahmedabad)'
    },
    profession: {
      company: 'Goldman Sachs',
      designation: 'Vice President',
      income: 55,
      industry: 'Investment Banking'
    },
    family: {
      siblings: 2,
      familyType: 'Joint',
      familyValues: 'Moderate',
      fatherOccupation: 'Industrialist',
      motherOccupation: 'Homemaker'
    },
    lifestyle: {
      smoking: 'Never',
      drinking: 'Occasionally',
      diet: 'Vegetarian',
      openToPets: false,
      hobbies: ['Marathon Running', 'Vinyl Collecting', 'Tennis']
    },
    preferences: {
      preferredGender: 'Female',
      ageMin: 26,
      ageMax: 30,
      locations: ['Mumbai', 'Delhi NCR'],
      religions: ['Hindu'],
      castes: ['Agarwal', 'Gupta', 'Patidar', 'Open'],
      preferredOccupation: 'Finance / Marketing / Law / Doctor / Executive',
      preferredEducation: 'Bachelor\'s or Master\'s',
      preferredIncomeMin: 18,
      heightMin: 165,
      heightMax: 178,
      preferredMaritalStatus: 'Never Married',
      preferredDiet: 'Vegetarian'
    },
    journeyStatus: 'Connection',
    profileCompletion: 99,
    verified: true,
    lastContacted: '2026-09-07T10:00:00Z',
    notes: [],
    timeline: []
  },

  // 7. Priya Shah (Female, 27, Pune, Jain Shwetambar)
  {
    id: 'client-7',
    firstName: 'Priya',
    lastName: 'Shah',
    gender: 'Female',
    dob: '1997-07-22',
    age: 27,
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    height: 163, // 5'4"
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    aboutMe: 'Clinical Nutritionist & Wellness Consultant based in Pune. Values holistic health, spiritual mindfulness, and family togetherness.',
    religion: 'Jain',
    jainSect: 'Shwetambar',
    caste: 'Shah',
    motherTongue: 'Gujarati',
    languagesKnown: ['English', 'Gujarati', 'Marathi', 'Hindi'],
    maritalStatus: 'Never Married',
    manglik: 'Non-Manglik',
    education: {
      undergradCollege: 'SNDT Womens University',
      degree: 'B.Sc Nutrition',
      postgradDegree: 'M.Sc Clinical Dietetics'
    },
    profession: {
      company: 'Apollo Hospitals Pune',
      designation: 'Senior Nutrition Consultant',
      income: 16,
      industry: 'Healthcare / Wellness'
    },
    family: {
      siblings: 1,
      familyType: 'Nuclear',
      familyValues: 'Moderate',
      fatherOccupation: 'Pharma Distributor',
      motherOccupation: 'Nutritionist'
    },
    lifestyle: {
      smoking: 'Never',
      drinking: 'Never',
      diet: 'Jain Vegetarian',
      openToPets: false,
      hobbies: ['Yoga', 'Organic Cooking', 'Reading']
    },
    preferences: {
      preferredGender: 'Male',
      ageMin: 27,
      ageMax: 32,
      locations: ['Pune', 'Mumbai'],
      religions: ['Jain'],
      jainPreference: 'Jain only',
      jainSect: 'Shwetambar',
      castes: ['Shah', 'Oswal', 'Any Jain'],
      preferredOccupation: 'Doctor / Engineer / Business Owner',
      preferredEducation: 'Bachelor\'s or Master\'s',
      preferredIncomeMin: 20,
      heightMin: 172,
      heightMax: 185,
      preferredMaritalStatus: 'Never Married',
      preferredDiet: 'Jain Vegetarian'
    },
    journeyStatus: 'Matching',
    profileCompletion: 90,
    verified: true,
    lastContacted: '2026-09-07T08:30:00Z',
    notes: [
      { id: 'n7', author: 'Matchmaker Maya', content: 'Scheduled call for 10:00 AM today to review shortlisted profiles.', createdAt: '2026-09-07T08:00:00Z' }
    ],
    timeline: []
  },

  // 8. Rahul Mehta (Male, 29, Pune, Hindu Brahmin)
  {
    id: 'client-8',
    firstName: 'Rahul',
    lastName: 'Mehta',
    gender: 'Male',
    dob: '1995-02-14',
    age: 29,
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    height: 176, // 5'9"
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    aboutMe: 'Data Science Lead at Nvidia Pune. Enthusiastic about AI research, classical guitar, and weekend cycling in the Western Ghats.',
    religion: 'Hindu',
    caste: 'Brahmin',
    subCaste: 'Deshastha',
    motherTongue: 'Marathi',
    languagesKnown: ['English', 'Marathi', 'Hindi'],
    maritalStatus: 'Never Married',
    manglik: 'Non-Manglik',
    education: {
      undergradCollege: 'COEP Pune',
      degree: 'B.Tech CS',
      postgradDegree: 'M.S. Data Science (CMU)'
    },
    profession: {
      company: 'Nvidia',
      designation: 'Staff Data Scientist',
      income: 42,
      industry: 'Artificial Intelligence / Semiconductors'
    },
    family: {
      siblings: 1,
      familyType: 'Nuclear',
      familyValues: 'Liberal',
      fatherOccupation: 'Retired Bank Manager',
      motherOccupation: 'Professor'
    },
    lifestyle: {
      smoking: 'Never',
      drinking: 'Occasionally',
      diet: 'Vegetarian',
      openToPets: true,
      hobbies: ['Guitar', 'Cycling', 'Astronomy']
    },
    preferences: {
      preferredGender: 'Female',
      ageMin: 25,
      ageMax: 29,
      locations: ['Pune', 'Mumbai'],
      religions: ['Hindu'],
      castes: ['Brahmin', 'Open'],
      preferredOccupation: 'Engineer / Scientist / Designer / Doctor',
      preferredEducation: 'Master\'s or B.Tech',
      preferredIncomeMin: 18,
      heightMin: 162,
      heightMax: 174,
      preferredMaritalStatus: 'Never Married',
      preferredDiet: 'Vegetarian'
    },
    journeyStatus: 'Profile Verified',
    profileCompletion: 95,
    verified: true,
    lastContacted: '2026-09-06T17:00:00Z',
    notes: [],
    timeline: []
  },

  // 9. Neha Jain (Female, 28, Jaipur, Jain Shwetambar)
  {
    id: 'client-9',
    firstName: 'Neha',
    lastName: 'Jain',
    gender: 'Female',
    dob: '1996-06-18',
    age: 28,
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    height: 164, // 5'4.5"
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    aboutMe: 'High school Mathematics Teacher & EdTech Curriculum Creator in Jaipur. Enjoys poetry writing, classical dance, and community service.',
    religion: 'Jain',
    jainSect: 'Shwetambar',
    caste: 'Khandelwal',
    motherTongue: 'Hindi',
    languagesKnown: ['English', 'Hindi', 'Rajasthani'],
    maritalStatus: 'Never Married',
    manglik: 'Non-Manglik',
    education: {
      undergradCollege: 'Rajasthan University',
      degree: 'B.Sc Mathematics',
      postgradDegree: 'M.Sc & B.Ed'
    },
    profession: {
      company: 'Neerja Modi School',
      designation: 'Senior Faculty & Curriculum Head',
      income: 14,
      industry: 'Education / EdTech'
    },
    family: {
      siblings: 2,
      familyType: 'Joint',
      familyValues: 'Traditional',
      fatherOccupation: 'Jewelry Business Owner',
      motherOccupation: 'Homemaker'
    },
    lifestyle: {
      smoking: 'Never',
      drinking: 'Never',
      diet: 'Jain Vegetarian',
      openToPets: false,
      hobbies: ['Poetry', 'Kathak Dance', 'Baking']
    },
    preferences: {
      preferredGender: 'Male',
      ageMin: 28,
      ageMax: 33,
      locations: ['Jaipur', 'Delhi NCR', 'Mumbai'],
      religions: ['Jain'],
      jainPreference: 'Jain only',
      jainSect: 'Shwetambar',
      castes: ['Khandelwal', 'Oswal', 'Any Jain'],
      preferredOccupation: 'Teacher / Professor / Business Owner / Civil Services / Engineer',
      preferredEducation: 'Master\'s or Bachelor\'s',
      preferredIncomeMin: 18,
      heightMin: 172,
      heightMax: 185,
      preferredMaritalStatus: 'Never Married',
      preferredDiet: 'Jain Vegetarian'
    },
    journeyStatus: 'Preferences Confirmed',
    profileCompletion: 88,
    verified: true,
    lastContacted: '2026-09-07T09:15:00Z',
    notes: [],
    timeline: []
  },

  // 10. Devansh Kothari (Male, 30, Mumbai, Jain Shwetambar) - Excellent match for Neha / Riya!
  {
    id: 'client-10',
    firstName: 'Devansh',
    lastName: 'Kothari',
    gender: 'Male',
    dob: '1994-04-08',
    age: 30,
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    height: 177, // 5'10"
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    aboutMe: 'Managing Partner at Kothari Gemological Consultants. Respectful, well-traveled, deeply rooted in Jain cultural philosophy.',
    religion: 'Jain',
    jainSect: 'Shwetambar',
    caste: 'Khandelwal',
    motherTongue: 'Hindi',
    languagesKnown: ['English', 'Hindi', 'Gujarati'],
    maritalStatus: 'Never Married',
    manglik: 'Non-Manglik',
    education: {
      undergradCollege: 'HR College Mumbai',
      degree: 'B.Com',
      postgradDegree: 'GIA Graduate Gemologist (California)'
    },
    profession: {
      company: 'Kothari Gems & Exports',
      designation: 'Managing Partner',
      income: 45,
      industry: 'Gems & Jewelry / Export'
    },
    family: {
      siblings: 1,
      familyType: 'Joint',
      familyValues: 'Traditional',
      fatherOccupation: 'Senior Partner Kothari Group',
      motherOccupation: 'Social Worker'
    },
    lifestyle: {
      smoking: 'Never',
      drinking: 'Never',
      diet: 'Jain Vegetarian',
      openToPets: false,
      hobbies: ['Badminton', 'Photography', 'Philanthropy']
    },
    preferences: {
      preferredGender: 'Female',
      ageMin: 25,
      ageMax: 29,
      locations: ['Mumbai', 'Jaipur', 'Ahmedabad'],
      religions: ['Jain'],
      jainPreference: 'Jain only',
      jainSect: 'Shwetambar',
      castes: ['Khandelwal', 'Oswal', 'Any Jain'],
      preferredOccupation: 'Education / Designer / CA / Management',
      preferredEducation: 'Bachelor\'s or Master\'s',
      preferredIncomeMin: 10,
      heightMin: 160,
      heightMax: 172,
      preferredMaritalStatus: 'Never Married',
      preferredDiet: 'Jain Vegetarian'
    },
    journeyStatus: 'Matching',
    profileCompletion: 94,
    verified: true,
    lastContacted: '2026-09-05T14:00:00Z',
    notes: [],
    timeline: []
  },

  // 11. Ananya Trivedi (Female, 26, Vadodara, Hindu Brahmin)
  {
    id: 'client-11',
    firstName: 'Ananya',
    lastName: 'Trivedi',
    gender: 'Female',
    dob: '1998-10-12',
    age: 26,
    city: 'Vadodara',
    state: 'Gujarat',
    country: 'India',
    height: 166,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    aboutMe: 'Dentist practicing at a private dental clinic in Vadodara. Warm, caring, and passionate about music and literature.',
    religion: 'Hindu',
    caste: 'Brahmin',
    subCaste: 'Nagar Brahmin',
    motherTongue: 'Gujarati',
    languagesKnown: ['English', 'Gujarati', 'Hindi'],
    maritalStatus: 'Never Married',
    manglik: 'Non-Manglik',
    education: {
      undergradCollege: 'KM Shah Dental College',
      degree: 'BDS',
      postgradDegree: 'MDS Orthodontics'
    },
    profession: {
      company: 'Trivedi Dental Care',
      designation: 'Lead Orthodontist',
      income: 20,
      industry: 'Healthcare / Dental'
    },
    family: {
      siblings: 1,
      familyType: 'Nuclear',
      familyValues: 'Moderate',
      fatherOccupation: 'Professor of Chemistry',
      motherOccupation: 'School Principal'
    },
    lifestyle: {
      smoking: 'Never',
      drinking: 'Never',
      diet: 'Vegetarian',
      openToPets: true,
      hobbies: ['Violin', 'Reading', 'Gardening']
    },
    preferences: {
      preferredGender: 'Male',
      ageMin: 27,
      ageMax: 31,
      locations: ['Vadodara', 'Ahmedabad', 'Mumbai', 'Pune'],
      religions: ['Hindu'],
      castes: ['Brahmin', 'Open'],
      preferredOccupation: 'Doctor / Dentist / Engineer / CA',
      preferredEducation: 'Medical / Master\'s',
      preferredIncomeMin: 22,
      heightMin: 173,
      heightMax: 186,
      preferredMaritalStatus: 'Never Married',
      preferredDiet: 'Vegetarian'
    },
    journeyStatus: 'New Lead',
    profileCompletion: 85,
    verified: true,
    lastContacted: '2026-09-06T11:00:00Z',
    notes: [],
    timeline: []
  },

  // 12. Kabir Singhania (Male, 32, Chandigarh, Sikh)
  {
    id: 'client-12',
    firstName: 'Kabir',
    lastName: 'Singhania',
    gender: 'Male',
    dob: '1994-05-19',
    age: 32,
    city: 'Chandigarh',
    state: 'Punjab',
    country: 'India',
    height: 183,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    aboutMe: 'Corporate Lawyer at a premier law firm in Chandigarh. Enthusiastic about sports, international diplomacy, and Punjabi heritage.',
    religion: 'Sikh',
    caste: 'Jat Sikh',
    motherTongue: 'Punjabi',
    languagesKnown: ['English', 'Punjabi', 'Hindi'],
    maritalStatus: 'Never Married',
    manglik: 'Non-Manglik',
    education: {
      undergradCollege: 'National Law University Punjab',
      degree: 'BA LL.B (Hons)',
      postgradDegree: 'LL.M Corporate Law'
    },
    profession: {
      company: 'Singhania & Partners LLP',
      designation: 'Senior Legal Associate',
      income: 30,
      industry: 'Legal Services'
    },
    family: {
      siblings: 1,
      familyType: 'Nuclear',
      familyValues: 'Moderate',
      fatherOccupation: 'High Court Advocate',
      motherOccupation: 'Architect'
    },
    lifestyle: {
      smoking: 'Never',
      drinking: 'Occasionally',
      diet: 'Non-Vegetarian',
      openToPets: true,
      hobbies: ['Squash', 'Horse Riding', 'Debating']
    },
    preferences: {
      preferredGender: 'Female',
      ageMin: 26,
      ageMax: 30,
      locations: ['Chandigarh', 'Delhi NCR', 'Punjab'],
      religions: ['Sikh', 'Hindu'],
      castes: ['Jat Sikh', 'Khatri', 'Open'],
      preferredOccupation: 'Lawyer / Corporate Executive / Designer / Doctor',
      preferredEducation: 'Law / MBA / Bachelor\'s',
      preferredIncomeMin: 15,
      heightMin: 165,
      heightMax: 178,
      preferredMaritalStatus: 'Never Married',
      preferredDiet: 'No Preference'
    },
    journeyStatus: 'Profile Verified',
    profileCompletion: 92,
    verified: true,
    lastContacted: '2026-09-04T15:00:00Z',
    notes: [],
    timeline: []
  }
];

export interface DashboardMetric {
  title: string;
  value: number;
  change: string;
  iconName: string;
}

export const ADMIN_STATS = {
  totalClients: 128,
  activeProfiles: 96,
  newThisWeek: 12,
  matchesSuggested: 43,
  pendingInterests: 18,
  connections: 9,
  followUpsDue: 7,
  highCompatibility: 16
};

export const TODAY_FOLLOWUPS = [
  {
    id: 'f1',
    clientName: 'Priya Shah',
    clientId: 'client-7',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    task: 'Call about shortlisted match (Arjun)',
    dueTime: '10:00 AM',
    priority: 'High',
    status: 'Pending'
  },
  {
    id: 'f2',
    clientName: 'Rahul Mehta',
    clientId: 'client-8',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    task: 'Follow up regarding interest request from Neha',
    dueTime: '11:30 AM',
    priority: 'Medium',
    status: 'Pending'
  },
  {
    id: 'f3',
    clientName: 'Neha Jain',
    clientId: 'client-9',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    task: 'Review new partner preferences (Jain Sect preference)',
    dueTime: '02:00 PM',
    priority: 'High',
    status: 'Pending'
  },
  {
    id: 'f4',
    clientName: 'Aditi Sharma',
    clientId: 'client-5',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    task: 'Contact family regarding horoscope verification',
    dueTime: '04:00 PM',
    priority: 'Medium',
    status: 'Pending'
  },
  {
    id: 'f5',
    clientName: 'Kunal Patel',
    clientId: 'client-4',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    task: 'Share new match suggestions for Bangalore location',
    dueTime: '05:30 PM',
    priority: 'Low',
    status: 'Pending'
  }
];

export const RECENT_ACTIVITIES = [
  {
    id: 'act1',
    text: 'Riya Sharma matched with Arjun Mehta',
    detail: '92% compatibility score calculated',
    timestamp: '2 hours ago',
    avatar1: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 'act2',
    text: 'Meera Shah shortlisted Kunal Jain',
    detail: '87% compatibility score',
    timestamp: '4 hours ago',
    avatar1: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    avatar2: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 'act3',
    text: 'Family interest received for Sneha Patel',
    detail: 'New interest request sent from Rohan Gupta',
    timestamp: '6 hours ago',
    avatar1: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 'act4',
    text: 'Rahul Verma accepted connection request',
    detail: 'Direct contact details exchanged with Matchmaker approval',
    timestamp: '1 day ago',
    avatar1: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&q=80'
  }
];

export const ANALYTICS_DATA = {
  funnel: [
    { stage: 'Total Profiles', count: 128 },
    { stage: 'Profiles Screened', count: 112 },
    { stage: 'Matches Suggested', count: 74 },
    { stage: 'Interests Sent', count: 43 },
    { stage: 'Interests Accepted', count: 26 },
    { stage: 'Connections Established', count: 14 }
  ],
  byReligion: [
    { name: 'Jain', percentage: 42, color: '#e11d48' },
    { name: 'Hindu', percentage: 38, color: '#f97316' },
    { name: 'Sikh', percentage: 10, color: '#eab308' },
    { name: 'Muslim', percentage: 5, color: '#10b981' },
    { name: 'Christian', percentage: 3, color: '#3b82f6' },
    { name: 'Other', percentage: 2, color: '#8b5cf6' }
  ],
  clientGrowth: [
    { month: 'Jul', clients: 84 },
    { month: 'Aug', clients: 95 },
    { month: 'Sep', clients: 108 },
    { month: 'Oct', clients: 115 },
    { month: 'Nov', clients: 122 },
    { month: 'Dec', clients: 128 }
  ]
};
