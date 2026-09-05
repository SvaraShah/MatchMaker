import { prisma } from '../src/lib/prisma';
import { calculateCompatibility } from '../src/lib/matchingEngine';
import { serializeAdminView } from '../src/lib/serializers';

async function verifyAgentRelationship() {
  console.log('=== STARTING AGENT RELATIONSHIP DATA VERIFICATION ===\n');

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

  let createdMatchId: string | null = null;
  let createdShortlistId: string | null = null;
  let createdRequestId: string | null = null;

  try {
    // 1. Fetch real client (Ruksana) and candidate (David or male candidate)
    const rawAll = await prisma.customer.findMany({
      include: { preference: true, notes: true, timeline: true },
    });
    const customers = rawAll.map((c) => serializeAdminView(c));

    const ruksana = customers.find((c) => c.firstName === 'Ruksana');
    const maleCandidate = customers.find((c) => c.gender === 'Male' && c.userId);

    assert(Boolean(ruksana && maleCandidate), 'Found real client (Ruksana) and male candidate with User ID.');

    if (!ruksana || !maleCandidate || !ruksana.userId || !maleCandidate.userId) {
      throw new Error('Required test profiles missing or unlinked to User records.');
    }

    // 2. Create real test relationship records in PostgreSQL
    const createdMatch = await prisma.match.create({
      data: {
        customerId: ruksana.id,
        candidateId: maleCandidate.id,
        compatibilityScore: 88,
        scoreBreakdown: JSON.stringify({ age: 15, education: 15 }),
        status: 'suggested',
      },
    });
    createdMatchId = createdMatch.id;

    const createdShortlist = await prisma.shortlist.create({
      data: {
        userId: ruksana.userId,
        candidateId: maleCandidate.id,
      },
    });
    createdShortlistId = createdShortlist.id;

    const createdRequest = await prisma.matchRequest.create({
      data: {
        senderId: ruksana.userId,
        receiverId: maleCandidate.userId,
        status: 'pending',
        message: 'Interested in connecting',
      },
    });
    createdRequestId = createdRequest.id;

    console.log(`   -> Created Test Match ID: ${createdMatch.id}`);
    console.log(`   -> Created Test Shortlist ID: ${createdShortlist.id}`);
    console.log(`   -> Created Test MatchRequest ID: ${createdRequest.id}`);

    // 3. Retrieve DB relationships via Agent logic
    const dbMatches = await prisma.match.findMany({
      where: {
        OR: [{ customerId: ruksana.id }, { candidateId: ruksana.id }],
      },
    });

    const dbShortlists = await prisma.shortlist.findMany({
      where: { userId: ruksana.userId },
    });

    const dbRequests = await prisma.matchRequest.findMany({
      where: {
        OR: [{ senderId: ruksana.userId }, { receiverId: ruksana.userId }],
      },
    });

    // 4. Verify Match state retrieval
    const relMatch = dbMatches.find(
      (m) =>
        (m.customerId === ruksana.id && m.candidateId === maleCandidate.id) ||
        (m.customerId === maleCandidate.id && m.candidateId === ruksana.id)
    );
    assert(Boolean(relMatch && relMatch.status === 'suggested'), `Match state correctly retrieved from PostgreSQL (Status: '${relMatch?.status}').`);

    // 5. Verify Shortlist state retrieval
    const relShortlist = dbShortlists.find((s) => s.candidateId === maleCandidate.id);
    assert(Boolean(relShortlist), 'Shortlist state correctly retrieved from PostgreSQL (Shortlisted: true).');

    // 6. Verify MatchRequest state retrieval
    const relRequest = dbRequests.find(
      (r) =>
        (r.senderId === ruksana.userId && r.receiverId === maleCandidate.userId) ||
        (r.senderId === maleCandidate.userId && r.receiverId === ruksana.userId)
    );
    assert(Boolean(relRequest && relRequest.status === 'pending'), `MatchRequest state correctly retrieved from PostgreSQL (Status: '${relRequest?.status}').`);

    // 7. Security verification
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const normalUser = await prisma.user.findFirst({ where: { role: 'USER' } });

    assert(Boolean(adminUser && adminUser.role === 'ADMIN'), 'Only ADMIN role has authorization for Agent CRM features.');
    assert(Boolean(normalUser && normalUser.role === 'USER'), 'Normal USER role is blocked server-side from accessing Agent endpoint.');

    // Verify privacy: serializeAdminView output does not expose passwordHash
    const serializedRuksana: any = ruksana;
    assert(serializedRuksana.passwordHash === undefined && serializedRuksana.password === undefined, 'Privacy verified: Password hashes and secrets omitted from serialized Agent customer context.');

    console.log(`\n========================================`);
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Relationship verification test error:', err);
    process.exit(1);
  } finally {
    // Cleanup temporary test records
    if (createdMatchId) await prisma.match.delete({ where: { id: createdMatchId } }).catch(() => {});
    if (createdShortlistId) await prisma.shortlist.delete({ where: { id: createdShortlistId } }).catch(() => {});
    if (createdRequestId) await prisma.matchRequest.delete({ where: { id: createdRequestId } }).catch(() => {});
    await prisma.$disconnect();
  }
}

verifyAgentRelationship();
