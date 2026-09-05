export interface Note {
  id: string;
  author: string;
  content: string;
  createdAt: string; // ISO String
}

export interface TimelineEvent {
  id: string;
  type: 
    | 'lead_created' 
    | 'profile_verified' 
    | 'match_search' 
    | 'match_sent' 
    | 'meeting_scheduled' 
    | 'active_discussion' 
    | 'call_completed'
    | 'status_changed' 
    | 'note_added' 
    | 'success';
  title: string;
  description: string;
  createdAt: string; // ISO String
}

export interface EducationInfo {
  undergradCollege: string;
  degree: string;
  postgradDegree?: string;
}

export interface ProfessionalInfo {
  company: string;
  designation: string;
  income: number; // in LPA (Lakhs Per Annum)
  industry: string;
}

export interface FamilyInfo {
  siblings: number;
  familyType: 'Joint' | 'Nuclear';
  parentsOccupation: string;
}

export interface LifestyleInfo {
  smoking: 'No' | 'Occasionally' | 'Yes';
  drinking: 'No' | 'Occasionally' | 'Yes';
  diet: 'Vegetarian' | 'Non-Vegetarian' | 'Eggetarian';
  openToPets: boolean;
}

export interface MarriagePreferences {
  ageMin: number;
  ageMax: number;
  locations: string[]; // List of preferred cities
  religions: string[]; // List of preferred religions
  castes: string[]; // List of preferred castes, or ['Any']
  wantKids: 'Yes' | 'No' | 'Open';
  openToRelocate: 'Yes' | 'No' | 'Depends';
  horoscopeRequired: boolean;
  manglikStatus: 'Manglik' | 'Non-Manglik' | 'Any';
}

export type JourneyStatus =
  | 'New Lead'
  | 'Profile Verified'
  | 'Match Search'
  | 'Match Sent'
  | 'Meeting Scheduled'
  | 'Active Discussion'
  | 'Success';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female';
  dob: string; // ISO String
  age: number;
  country: string;
  state?: string;
  city: string;
  height: number; // in cm
  religion: 'Hindu' | 'Muslim' | 'Christian' | 'Sikh' | 'Jain' | 'Parsi';
  caste: string;
  motherTongue: string;
  languagesKnown: string[];
  email: string;
  phone: string;
  photoUrl?: string;
  aboutMe?: string;
  maritalStatus?: string;
  education: EducationInfo;
  profession: ProfessionalInfo;
  family: FamilyInfo;
  lifestyle: LifestyleInfo;
  preferences: MarriagePreferences;
  journeyStatus: JourneyStatus;
  notes: Note[];
  timeline: TimelineEvent[];
  lastUpdated: string; // ISO String
}

export interface MatchState {
  customerId: string;
  matchId: string;
  status: 'saved' | 'rejected' | 'sent';
  aiIntroduction?: string;
  aiExplanation?: string;
  createdAt: string; // ISO String
}

export interface MatchRecommendation {
  profile: Customer;
  score: number;
  scoreBreakdown: {
    age: number;
    education: number;
    career: number;
    religion: number;
    family: number;
    lifestyle: number;
    relocation: number;
    children: number;
  };
  aiExplanation: string;
  aiIntroduction: string;
  status?: 'saved' | 'rejected' | 'sent';
}

export interface DashboardStats {
  totalClients: number;
  activeMatches: number;
  successRate: number;
  pendingVerifications: number;
}
