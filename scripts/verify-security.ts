import { serializePublicUserView } from '../src/lib/serializers';
import { generateAIMatchPitches } from '../src/lib/ai/matchAnalysis';

async function verifySecurityAndAI() {
  console.log('--- TESTING PRIVACY SERIALIZERS & OPENAI FALLBACK ---');

  const rawCustomer = {
    id: 'test-001',
    userId: 'user-001',
    firstName: 'TestFirst',
    lastName: 'TestLast',
    gender: 'Female',
    dob: '1995-05-15',
    age: 29,
    country: 'India',
    city: 'Mumbai',
    height: 165,
    religion: 'Hindu',
    caste: 'Brahmin',
    motherTongue: 'Hindi',
    languagesKnown: JSON.stringify(['English', 'Hindi']),
    email: 'private.email@example.com',
    phone: '+91 99999 88888',
    undergradCollege: 'IIT Bombay',
    degree: 'B.Tech',
    postgradDegree: 'MBA',
    company: 'Tech Corp',
    designation: 'Product Manager',
    income: 30,
    industry: 'Technology',
    siblings: 1,
    familyType: 'Nuclear',
    parentsOccupation: 'Engineers',
    smoking: 'No',
    drinking: 'No',
    diet: 'Vegetarian',
    openToPets: true,
    journeyStatus: 'Profile Verified',
    passwordHash: '$2a$10$SecretHashKeyDoNotExpose',
    notes: [{ author: 'Admin', content: 'Secret internal note' }],
    auditLogs: [{ action: 'ADMIN_LOOKUP' }],
  };

  const serializedUserView = serializePublicUserView(rawCustomer as any);

  // Verify private fields are stripped
  if ((serializedUserView as any).email) throw new Error('PRIVACY VIOLATION: email exposed in public user view!');
  if ((serializedUserView as any).phone) throw new Error('PRIVACY VIOLATION: phone exposed in public user view!');
  if ((serializedUserView as any).passwordHash) throw new Error('PRIVACY VIOLATION: passwordHash exposed!');
  if ((serializedUserView as any).notes) throw new Error('PRIVACY VIOLATION: admin notes exposed!');
  if ((serializedUserView as any).auditLogs) throw new Error('PRIVACY VIOLATION: auditLogs exposed!');

  console.log('✓ Privacy Serializers: Phone, email, passwordHash, and admin notes stripped from User View');

  // Test OpenAI fallback when no API key is provided
  const pitch = await generateAIMatchPitches(rawCustomer, { ...rawCustomer, firstName: 'Prospect' }, 88);
  if (!pitch.aiExplanation || !pitch.aiIntroduction) {
    throw new Error('AI Fallback failed to return structured result');
  }

  console.log('✓ OpenAI Fallback: Successfully generated clean deterministic pitch without crashing');
  console.log('✅ PRIVACY & OPENAI FALLBACK: PASS');
}

verifySecurityAndAI().catch((e) => {
  console.error('❌ SECURITY VERIFICATION FAIL:', e);
  process.exit(1);
});
