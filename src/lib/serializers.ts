import { Customer, CustomerPreference } from '@prisma/client';

export interface PublicCustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  age: number;
  country: string;
  city: string;
  height: number;
  religion: string;
  caste: string;
  motherTongue: string;
  languagesKnown: string[];
  photoUrl?: string | null;
  aboutMe?: string | null;
  education: {
    undergradCollege: string;
    degree: string;
    postgradDegree?: string | null;
  };
  profession: {
    company: string;
    designation: string;
    income: number;
    industry: string;
  };
  family: {
    siblings: number;
    familyType: string;
    parentsOccupation: string;
  };
  lifestyle: {
    smoking: string;
    drinking: string;
    diet: string;
    openToPets: boolean;
  };
  preferences?: {
    ageMin: number;
    ageMax: number;
    locations: string[];
    religions: string[];
    castes: string[];
    wantKids: string;
    openToRelocate: string;
    horoscopeRequired: boolean;
    manglikStatus: string;
  } | null;
}

export function parseJsonField<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

export function serializePublicUserView(
  customer: any,
  preference?: any
): PublicCustomerProfile {
  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    gender: customer.gender,
    dob: customer.dob,
    age: customer.age,
    country: customer.country,
    city: customer.city,
    height: customer.height,
    religion: customer.religion,
    caste: customer.caste,
    motherTongue: customer.motherTongue,
    languagesKnown: parseJsonField<string[]>(customer.languagesKnown, ['English', 'Hindi']),
    photoUrl: customer.photoUrl || null,
    aboutMe: customer.aboutMe || null,
    education: {
      undergradCollege: customer.undergradCollege,
      degree: customer.degree,
      postgradDegree: customer.postgradDegree,
    },
    profession: {
      company: customer.company,
      designation: customer.designation,
      income: customer.income,
      industry: customer.industry,
    },
    family: {
      siblings: customer.siblings,
      familyType: customer.familyType,
      parentsOccupation: customer.parentsOccupation,
    },
    lifestyle: {
      smoking: customer.smoking,
      drinking: customer.drinking,
      diet: customer.diet,
      openToPets: customer.openToPets,
    },
    preferences: preference || customer.preference ? {
      ageMin: (preference || customer.preference).ageMin,
      ageMax: (preference || customer.preference).ageMax,
      locations: parseJsonField<string[]>((preference || customer.preference).locations, []),
      religions: parseJsonField<string[]>((preference || customer.preference).religions, []),
      castes: parseJsonField<string[]>((preference || customer.preference).castes, ['Any']),
      wantKids: (preference || customer.preference).wantKids,
      openToRelocate: (preference || customer.preference).openToRelocate,
      horoscopeRequired: (preference || customer.preference).horoscopeRequired,
      manglikStatus: (preference || customer.preference).manglikStatus,
    } : null,
  };
}

export function serializeAdminView(customer: any) {
  return {
    id: customer.id,
    userId: customer.userId,
    firstName: customer.firstName,
    lastName: customer.lastName,
    gender: customer.gender,
    dob: customer.dob,
    age: customer.age,
    country: customer.country,
    city: customer.city,
    height: customer.height,
    religion: customer.religion,
    caste: customer.caste,
    motherTongue: customer.motherTongue,
    languagesKnown: parseJsonField<string[]>(customer.languagesKnown, ['English', 'Hindi']),
    email: customer.email,
    phone: customer.phone,
    education: {
      undergradCollege: customer.undergradCollege,
      degree: customer.degree,
      postgradDegree: customer.postgradDegree,
    },
    profession: {
      company: customer.company,
      designation: customer.designation,
      income: customer.income,
      industry: customer.industry,
    },
    family: {
      siblings: customer.siblings,
      familyType: customer.familyType,
      parentsOccupation: customer.parentsOccupation,
    },
    lifestyle: {
      smoking: customer.smoking,
      drinking: customer.drinking,
      diet: customer.diet,
      openToPets: customer.openToPets,
    },
    preferences: customer.preference ? {
      ageMin: customer.preference.ageMin,
      ageMax: customer.preference.ageMax,
      locations: parseJsonField<string[]>(customer.preference.locations, []),
      religions: parseJsonField<string[]>(customer.preference.religions, []),
      castes: parseJsonField<string[]>(customer.preference.castes, ['Any']),
      wantKids: customer.preference.wantKids,
      openToRelocate: customer.preference.openToRelocate,
      horoscopeRequired: customer.preference.horoscopeRequired,
      manglikStatus: customer.preference.manglikStatus,
    } : null,
    journeyStatus: customer.journeyStatus,
    notes: customer.notes || [],
    timeline: customer.timeline || [],
    lastUpdated: customer.lastUpdated ? new Date(customer.lastUpdated).toISOString() : new Date().toISOString(),
  };
}
