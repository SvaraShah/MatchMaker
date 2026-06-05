import fs from 'fs';
import path from 'path';
import { Customer, JourneyStatus, Note, TimelineEvent, MatchState, MarriagePreferences } from '../src/types/matchmaker';

// Lists of authentic Indian names categorized by religion
const HINDU_MALE = ['Rahul', 'Vikram', 'Amit', 'Rohan', 'Aditya', 'Sanjay', 'Kunal', 'Dev', 'Arjun', 'Manish', 'Anand', 'Gaurav', 'Kartik', 'Abhishek', 'Nikhil', 'Siddharth', 'Rishabh', 'Raghav', 'Pranav', 'Varun', 'Aayush', 'Tushar', 'Mayank', 'Piyush', 'Ishaan', 'Kabir'];
const HINDU_FEMALE = ['Priya', 'Ananya', 'Neha', 'Pooja', 'Sneha', 'Shruti', 'Riya', 'Aditi', 'Divya', 'Meera', 'Shreya', 'Deepika', 'Tanvi', 'Kavya', 'Ishita', 'Riddhi', 'Payal', 'Kajal', 'Nisha', 'Aishwarya', 'Kriti', 'Rashi', 'Nidhi', 'Komal', 'Prisha', 'Diya'];

const MUSLIM_MALE = ['Imran', 'Tariq', 'Zahid', 'Faisal', 'Sameer', 'Arman', 'Kabir', 'Farhan', 'Yasir', 'Zeeshan', 'Adil', 'Arshad', 'Rehan', 'Zane', 'Siddique'];
const MUSLIM_FEMALE = ['Fatima', 'Zara', 'Aisha', 'Sana', 'Yasmin', 'Farah', 'Nida', 'Saniya', 'Heena', 'Zoya', 'Alia', 'Mariam', 'Ruksana'];

const CHRISTIAN_MALE = ['Joseph', 'David', 'Thomas', 'John', 'Kevin', 'Alan', 'Mathew', 'Paul', 'Andrew', 'Luke'];
const CHRISTIAN_FEMALE = ['Maria', 'Anjali', 'Sherry', 'Susan', 'Sarah', 'Elizabeth', 'Michelle', 'Rachel', 'Rebecca'];

const SIKH_MALE = ['Gurpreet', 'Harpreet', 'Jaspreet', 'Amanpreet', 'Manbir', 'Gurbaksh', 'Angad', 'Rajbir', 'Diljit', 'Manpreet'];
const SIKH_FEMALE = ['Jasmeet', 'Harpreet', 'Gurleen', 'Simran', 'Navneet', 'Kiranjeet', 'Prabhjot', 'Ravneet', 'Amrit', 'Kaur'];

const JAIN_MALE = ['Arihant', 'Rishabh', 'Shreyans', 'Sambhav', 'Pratham', 'Akshay', 'Samyak'];
const JAIN_FEMALE = ['Jinisha', 'Aachal', 'Rashi', 'Vidhi', 'Priyanka', 'Sonal', 'Nisha'];

const PARSI_MALE = ['Cyrus', 'Boman', 'Zubin', 'Farokh', 'Armin', 'Hormazd', 'Jamshed'];
const PARSI_FEMALE = ['Shenaz', 'Delnaz', 'Shirin', 'Anahita', 'Persis', 'Freny'];

const SURNAMES = [
  'Sharma', 'Patel', 'Verma', 'Iyer', 'Nair', 'Reddy', 'Gupta', 'Banerjee', 'Rao', 'Joshi',
  'Mehta', 'Singh', 'Gill', 'Bhatia', 'Kulkarni', 'Deshmukh', 'Kapoor', 'Khan', 'Sheikh',
  'D\'Souza', 'Fernandes', 'Gada', 'Shah', 'Sodhi', 'Contractor', 'Wala', 'Sen', 'Choudhury',
  'Mishra', 'Trivedi', 'Chatterjee', 'Dubey', 'Saxena', 'Desai', 'Bhatt', 'Shetty', 'Pillai'
];

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Jaipur',
  'Ahmedabad', 'Lucknow', 'Chandigarh', 'Kochi', 'Indore', 'Surat', 'Dehradun'
];

const RELIGIONS: Customer['religion'][] = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Parsi'];

const CASTES: Record<string, string[]> = {
  Hindu: ['Brahmin', 'Kshatriya', 'Vaishya', 'Kayastha', 'Nair', 'Iyer', 'Iyengar', 'Reddy', 'Patel', 'Maratha', 'Jat', 'Baniya'],
  Muslim: ['Sunni', 'Shia', 'Pathan', 'Syed', 'Sheikh'],
  Christian: ['Roman Catholic', 'Protestant', 'Syrian Christian', 'Orthodox'],
  Sikh: ['Jat Sikh', 'Khatri', 'Arora', 'Ramgarhia'],
  Jain: ['Oswal', 'Digambar', 'Shvetambar', 'Porwal'],
  Parsi: ['Parsi']
};

const MOTHER_TONGUES = [
  'Hindi', 'English', 'Gujarati', 'Marathi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Marwari'
];

const INDUSTRIES = [
  'Technology', 'Healthcare & Medicine', 'Financial Services & Investment Banking',
  'Management Consulting', 'Real Estate & Construction', 'Government & Civil Services',
  'Education & Research', 'Automobile', 'E-commerce & Retail', 'Entertainment & Media'
];

const DESIGNATIONS_BY_INDUSTRY: Record<string, string[]> = {
  'Technology': ['Software Engineer', 'Senior Software Engineer', 'Product Manager', 'Engineering Manager', 'Data Scientist', 'Director of Engineering', 'Solution Architect'],
  'Healthcare & Medicine': ['Consultant Cardiologist', 'General Physician', 'Resident Doctor', 'Pediatrician', 'Dentist', 'Orthopedic Surgeon', 'Radiologist'],
  'Financial Services & Investment Banking': ['Investment Banker', 'Chartered Accountant', 'Financial Analyst', 'Risk Manager', 'Portfolio Manager', 'VP Finance'],
  'Management Consulting': ['Management Consultant', 'Senior Associate', 'Engagement Manager', 'Partner', 'Strategy Consultant'],
  'Real Estate & Construction': ['Project Manager', 'Architect', 'Civil Engineer', 'Property Developer', 'Real Estate Investor'],
  'Government & Civil Services': ['IAS Officer', 'IPS Officer', 'IRS Officer', 'Public Sector Engineer', 'Government Researcher'],
  'Education & Research': ['Assistant Professor', 'Research Scientist', 'Ph.D. Scholar', 'Academic Director', 'Postdoctoral Fellow'],
  'Automobile': ['Design Engineer', 'Plant Manager', 'Product Planner', 'Automotive Consultant'],
  'E-commerce & Retail': ['Category Manager', 'Operations Manager', 'Supply Chain Director', 'Co-Founder'],
  'Entertainment & Media': ['Creative Director', 'Content Strategist', 'Journalist', 'Media Consultant']
};

const COLLEGES_UNDERGRAD = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'BITS Pilani', 'Delhi University (SRCC)', 'St. Stephen\'s College',
  'NMIMS', 'RV College of Engineering', 'LSR Delhi', 'Christ University', 'MIT Manipal', 'COEP Pune', 'HR College'
];

const DEGREES_UNDERGRAD = ['B.Tech', 'B.E.', 'B.Sc', 'B.Com', 'B.A.', 'BBA', 'B.Arch', 'BDS', 'MBBS'];

const COLLEGES_POSTGRAD = [
  'IIM Ahmedabad', 'IIM Bangalore', 'IIM Calcutta', 'ISB Hyderabad', 'IIT Delhi', 'FMS Delhi',
  'XLRI Jamshedpur', 'BITS Pilani', 'London School of Economics', 'Columbia University', 'Stanford University'
];

const DEGREES_POSTGRAD = ['M.Tech', 'M.S.', 'MBA', 'M.A.', 'M.Sc', 'MD', 'MS (Surgery)', 'LLM', 'M.Des'];

const PARENTS_OCCUPATION = [
  'Retired Government Officer', 'Businessman (Manufacturing)', 'Doctor (General Practitioner)',
  'Professor at State University', 'Retired Banker', 'Housewife & Homemaker', 'Chartered Accountant',
  'Real Estate Developer', 'Civil Servant (IAS)', 'Software Consultant'
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElements<T>(arr: T[], countRange: [number, number]): T[] {
  const count = Math.floor(Math.random() * (countRange[1] - countRange[0] + 1)) + countRange[0];
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generates an authentic profile
function generateProfile(id: string, index: number): Customer {
  const gender: 'Male' | 'Female' = index % 2 === 0 ? 'Male' : 'Female';
  const religion = getRandomElement(RELIGIONS);
  const caste = getRandomElement(CASTES[religion]);
  
  // Pick names based on religion and gender
  let firstName = '';
  if (religion === 'Hindu') {
    firstName = gender === 'Male' ? getRandomElement(HINDU_MALE) : getRandomElement(HINDU_FEMALE);
  } else if (religion === 'Muslim') {
    firstName = gender === 'Male' ? getRandomElement(MUSLIM_MALE) : getRandomElement(MUSLIM_FEMALE);
  } else if (religion === 'Christian') {
    firstName = gender === 'Male' ? getRandomElement(CHRISTIAN_MALE) : getRandomElement(CHRISTIAN_FEMALE);
  } else if (religion === 'Sikh') {
    firstName = gender === 'Male' ? getRandomElement(SIKH_MALE) : getRandomElement(SIKH_FEMALE);
  } else if (religion === 'Jain') {
    firstName = gender === 'Male' ? getRandomElement(JAIN_MALE) : getRandomElement(JAIN_FEMALE);
  } else {
    firstName = gender === 'Male' ? getRandomElement(PARSI_MALE) : getRandomElement(PARSI_FEMALE);
  }
  
  // Ensure names are uniquely seeded with index if duplicate
  if (index > 50) {
    firstName = `${firstName} ${String.fromCharCode(65 + (index % 26))}.`;
  }
  const lastName = getRandomElement(SURNAMES);
  
  const age = getRandomInt(24, 38);
  const birthYear = 2026 - age;
  const dob = `${birthYear}-${String(getRandomInt(1, 12)).padStart(2, '0')}-${String(getRandomInt(1, 28)).padStart(2, '0')}T00:00:00.000Z`;
  
  const city = getRandomElement(CITIES);
  const height = gender === 'Male' ? getRandomInt(168, 188) : getRandomInt(152, 172);
  const motherTongue = getRandomElement(MOTHER_TONGUES);
  const languagesKnown = Array.from(new Set(['English', motherTongue, getRandomElement(MOTHER_TONGUES)]));
  
  const hasPostgrad = Math.random() > 0.4;
  const education = {
    undergradCollege: getRandomElement(COLLEGES_UNDERGRAD),
    degree: getRandomElement(DEGREES_UNDERGRAD),
    postgradDegree: hasPostgrad ? getRandomElement(DEGREES_POSTGRAD) : undefined
  };
  
  const industry = getRandomElement(INDUSTRIES);
  const designation = getRandomElement(DESIGNATIONS_BY_INDUSTRY[industry]);
  const company = getRandomElement(['TCS', 'Infosys', 'Google India', 'McKinsey & Co', 'PwC', 'Apollo Hospitals', 'Fortis', 'HDFC Bank', 'Reliance Industries', 'Tata Motors', 'Freelance/Co-Founder', 'Government of India']);
  // Income in LPA
  const baseIncome = industry === 'Technology' || industry === 'Healthcare & Medicine' || industry === 'Financial Services & Investment Banking' ? 15 : 6;
  const income = getRandomInt(baseIncome, baseIncome + (age - 24) * 3 + (hasPostgrad ? 8 : 0));
  
  const siblings = getRandomInt(0, 3);
  const familyType: 'Joint' | 'Nuclear' = Math.random() > 0.6 ? 'Joint' : 'Nuclear';
  const parentsOccupation = `${getRandomElement(PARENTS_OCCUPATION)} & ${Math.random() > 0.5 ? 'Homemaker' : 'Retired Professional'}`;
  
  const smoking: 'No' | 'Occasionally' | 'Yes' = Math.random() > 0.85 ? 'Yes' : (Math.random() > 0.7 ? 'Occasionally' : 'No');
  const drinking: 'No' | 'Occasionally' | 'Yes' = Math.random() > 0.8 ? 'Yes' : (Math.random() > 0.5 ? 'Occasionally' : 'No');
  const diet: 'Vegetarian' | 'Non-Vegetarian' | 'Eggetarian' = religion === 'Jain' ? 'Vegetarian' : (Math.random() > 0.5 ? 'Vegetarian' : (Math.random() > 0.8 ? 'Eggetarian' : 'Non-Vegetarian'));
  const openToPets = Math.random() > 0.4;
  
  // Preferences based on profile features
  const ageMin = gender === 'Male' ? age - 6 : age - 2;
  const ageMax = gender === 'Male' ? age + 1 : age + 5;
  const locations = [city, getRandomElement(CITIES), getRandomElement(CITIES)];
  const religions = Math.random() > 0.75 ? [religion] : [religion, getRandomElement(RELIGIONS)];
  const castes = Math.random() > 0.8 ? [caste] : ['Any'];
  const wantKids: 'Yes' | 'No' | 'Open' = Math.random() > 0.9 ? 'Open' : (Math.random() > 0.05 ? 'Yes' : 'No');
  const openToRelocate: 'Yes' | 'No' | 'Depends' = Math.random() > 0.5 ? 'Yes' : (Math.random() > 0.5 ? 'Depends' : 'No');
  const horoscopeRequired = religion === 'Hindu' ? Math.random() > 0.5 : false;
  const manglikStatus = religion === 'Hindu' && Math.random() > 0.8 ? 'Manglik' : (Math.random() > 0.6 ? 'Non-Manglik' : 'Any');
  
  const preferences: MarriagePreferences = {
    ageMin: Math.max(21, ageMin),
    ageMax: Math.min(50, ageMax),
    locations: Array.from(new Set(locations)),
    religions,
    castes,
    wantKids,
    openToRelocate,
    horoscopeRequired,
    manglikStatus
  };
  
  // Distribute journey statuses
  const statusRand = Math.random();
  let journeyStatus: JourneyStatus = 'New Lead';
  if (statusRand > 0.85) journeyStatus = 'Success';
  else if (statusRand > 0.7) journeyStatus = 'Active Discussion';
  else if (statusRand > 0.55) journeyStatus = 'Meeting Scheduled';
  else if (statusRand > 0.4) journeyStatus = 'Match Sent';
  else if (statusRand > 0.25) journeyStatus = 'Match Search';
  else if (statusRand > 0.1) journeyStatus = 'Profile Verified';
  
  // Mock notes
  const notes: Note[] = [];
  if (journeyStatus !== 'New Lead') {
    notes.push({
      id: `note-${id}-1`,
      author: 'Matchmaker Maya',
      content: `Completed the onboarding call. Verified that education is from ${education.undergradCollege} and profession is ${designation} at ${company}. Ready to start sourcing matches.`,
      createdAt: `${birthYear + 20}-${String(getRandomInt(1, 12)).padStart(2, '0')}-01T12:00:00.000Z`
    });
  }
  if (journeyStatus === 'Active Discussion' || journeyStatus === 'Success') {
    notes.push({
      id: `note-${id}-2`,
      author: 'Matchmaker Maya',
      content: 'Client reported having positive alignment after two calls. Discussing next steps with family.',
      createdAt: `2026-05-15T14:30:00.000Z`
    });
  }
  
  // Mock timeline
  const timeline: TimelineEvent[] = [
    {
      id: `evt-${id}-1`,
      type: 'lead_created',
      title: 'Lead Created',
      description: 'Profile entered CRM registry.',
      createdAt: `2026-01-10T10:00:00.000Z`
    }
  ];
  if (journeyStatus !== 'New Lead') {
    timeline.push({
      id: `evt-${id}-2`,
      type: 'profile_verified',
      title: 'Profile Verified',
      description: 'Biodata verified via LinkedIn and identity checks.',
      createdAt: `2026-01-12T11:15:00.000Z`
    });
  }
  if (journeyStatus === 'Match Sent' || journeyStatus === 'Meeting Scheduled' || journeyStatus === 'Active Discussion' || journeyStatus === 'Success') {
    timeline.push({
      id: `evt-${id}-3`,
      type: 'match_sent',
      title: 'Match Proposals Sent',
      description: 'Recommended 3 premium profiles to client.',
      createdAt: `2026-02-01T16:45:00.000Z`
    });
  }
  if (journeyStatus === 'Meeting Scheduled' || journeyStatus === 'Active Discussion' || journeyStatus === 'Success') {
    timeline.push({
      id: `evt-${id}-4`,
      type: 'meeting_scheduled',
      title: 'Meeting Scheduled',
      description: 'First formal meeting scheduled via Zoom.',
      createdAt: `2026-03-15T15:00:00.000Z`
    });
  }
  if (journeyStatus === 'Active Discussion' || journeyStatus === 'Success') {
    timeline.push({
      id: `evt-${id}-5`,
      type: 'active_discussion',
      title: 'Active Discussion',
      description: 'Both families have connected directly.',
      createdAt: `2026-04-20T10:30:00.000Z`
    });
  }
  if (journeyStatus === 'Success') {
    timeline.push({
      id: `evt-${id}-6`,
      type: 'success',
      title: 'Matchmaking Success',
      description: 'Wedding dates finalized. Client offboarded with congratulations.',
      createdAt: `2026-05-30T18:00:00.000Z`
    });
  }
  
  return {
    id,
    firstName,
    lastName,
    gender,
    dob,
    age,
    country: 'India',
    city,
    height,
    religion,
    caste,
    motherTongue,
    languagesKnown,
    email: `${firstName.toLowerCase().replace(/[^a-z]/g, '')}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
    phone: `+91 ${getRandomInt(70000, 99999)} ${getRandomInt(10000, 99999)}`,
    education,
    profession: {
      company,
      designation,
      income,
      industry
    },
    family: {
      siblings,
      familyType,
      parentsOccupation
    },
    lifestyle: {
      smoking,
      drinking,
      diet,
      openToPets
    },
    preferences,
    journeyStatus,
    notes,
    timeline: timeline.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    lastUpdated: new Date().toISOString()
  };
}

function runSeeder() {
  console.log('Starting seeder...');
  
  const customers: Customer[] = [];
  const totalProfiles = 130; // 130 profiles to comfortably exceed 120
  
  for (let i = 1; i <= totalProfiles; i++) {
    const id = `client-${String(i).padStart(3, '0')}`;
    customers.push(generateProfile(id, i));
  }
  
  // Generate some match states
  // We'll pre-populate some match states (saved, rejected, sent) for client-001, client-002, etc.
  const matchStates: MatchState[] = [];
  
  // For client 1 (let's say they are in "Match Search" status)
  const client1 = customers[0];
  const oppositeGenderPool = customers.filter(c => c.gender !== client1.gender);
  
  if (oppositeGenderPool.length >= 5) {
    // client 1 has saved some, rejected some, sent some
    matchStates.push({
      customerId: client1.id,
      matchId: oppositeGenderPool[0].id,
      status: 'saved',
      aiExplanation: 'Strong matches in career and life preferences. Both are tech consultants in Bangalore.',
      aiIntroduction: `Hi ${client1.firstName}, we recommend connecting with ${oppositeGenderPool[0].firstName}, a tech professional who also values joint family relations and vegetarian lifestyle.`,
      createdAt: new Date().toISOString()
    });
    matchStates.push({
      customerId: client1.id,
      matchId: oppositeGenderPool[1].id,
      status: 'sent',
      aiExplanation: 'Great relocation alignment and educational synergy.',
      aiIntroduction: `Hi ${client1.firstName}, we have sent you the details of ${oppositeGenderPool[1].firstName}. She is a Consultant in Delhi with an MBA from IIM Bangalore.`,
      createdAt: new Date().toISOString()
    });
    matchStates.push({
      customerId: client1.id,
      matchId: oppositeGenderPool[2].id,
      status: 'rejected',
      createdAt: new Date().toISOString()
    });
  }
  
  const dbContent = {
    customers,
    matches: matchStates
  };
  
  const dataDir = path.join(__dirname, '../src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(dataDir, 'db.json'),
    JSON.stringify(dbContent, null, 2),
    'utf-8'
  );
  
  console.log(`Success! Seeded ${customers.length} profiles and ${matchStates.length} match states into src/data/db.json.`);
}

runSeeder();
