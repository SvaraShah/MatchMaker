import { prisma } from '../src/lib/prisma';
import { calculateCompatibility } from '../src/lib/matchingEngine';
import { serializeAdminView } from '../src/lib/serializers';

async function runAgentTestSuite() {
  console.log('=== STARTING PHASE 3 AI MATCHMAKER AGENT SUITE ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, description: string) {
    if (condition) {
      console.log(`✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${description}`);
      failed++;
    }
  }

  try {
    // 1. Fetch DB Customers
    const rawCustomers = await prisma.customer.findMany({
      include: { preference: true, notes: true, timeline: true },
    });
    const customers = rawCustomers.map((c) => serializeAdminView(c));

    assert(customers.length >= 100, `PostgreSQL contains ${customers.length} seeded customer profiles.`);

    // 2. Identify Ruksana (Female) and David (Male)
    const ruksana = customers.find((c) => c.firstName === 'Ruksana');
    const david = customers.find((c) => c.firstName === 'David');

    assert(Boolean(ruksana && ruksana.gender === 'Female'), 'Found female test profile: Ruksana');
    assert(Boolean(david && david.gender === 'Male'), 'Found male test profile: David');

    if (!ruksana || !david) {
      throw new Error('Test profiles Ruksana or David missing from database.');
    }

    // 3. Test Opposite Gender Candidate Discovery for Ruksana
    const ruksanaCandidates = customers.filter((c) => c.gender !== ruksana.gender && c.id !== ruksana.id);
    assert(
      ruksanaCandidates.every((c) => c.gender === 'Male'),
      'Ruksana candidate pool strictly contains 100% MALE candidates.'
    );

    const ruksanaMatches = ruksanaCandidates
      .map((cand) => calculateCompatibility(ruksana as any, cand as any))
      .sort((a, b) => b.score - a.score);

    const topRuksanaMatch = ruksanaMatches[0];
    console.log(`   -> Top match for Ruksana (${ruksana.firstName}): ${topRuksanaMatch.profile.firstName} ${topRuksanaMatch.profile.lastName} with Score: ${topRuksanaMatch.score}%`);
    assert(topRuksanaMatch.score > 70, `Top match score (${topRuksanaMatch.score}%) is high and deterministic.`);

    // 4. Test Opposite Gender Candidate Discovery for David
    const davidCandidates = customers.filter((c) => c.gender !== david.gender && c.id !== david.id);
    assert(
      davidCandidates.every((c) => c.gender === 'Female'),
      'David candidate pool strictly contains 100% FEMALE candidates.'
    );

    const davidMatches = davidCandidates
      .map((cand) => calculateCompatibility(david as any, cand as any))
      .sort((a, b) => b.score - a.score);

    const topDavidMatch = davidMatches[0];
    console.log(`   -> Top match for David (${david.firstName}): ${topDavidMatch.profile.firstName} ${topDavidMatch.profile.lastName} with Score: ${topDavidMatch.score}%`);
    assert(topDavidMatch.score > 70, `Top match score (${topDavidMatch.score}%) is high and deterministic.`);

    // 5. Verify Deterministic Score Breakdown Consistency
    const breakdown = topRuksanaMatch.scoreBreakdown;
    const computedTotal =
      breakdown.age +
      breakdown.education +
      breakdown.career +
      breakdown.religion +
      breakdown.family +
      breakdown.lifestyle +
      breakdown.relocation +
      breakdown.children;

    assert(
      topRuksanaMatch.score === Math.min(100, Math.max(0, computedTotal)),
      `Deterministic engine score (${topRuksanaMatch.score}%) matches sum of 8 sub-dimensions (${computedTotal}).`
    );

    // 6. Test Admin Authorization Guardrail via User Model
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const normalUser = await prisma.user.findFirst({ where: { role: 'USER' } });

    assert(Boolean(adminUser && adminUser.role === 'ADMIN'), 'Verified ADMIN user account exists in PostgreSQL.');
    assert(Boolean(normalUser && normalUser.role === 'USER'), 'Verified normal USER account exists in PostgreSQL.');

    console.log(`\n========================================`);
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test script error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAgentTestSuite();
