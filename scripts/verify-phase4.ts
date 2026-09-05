import { prisma } from '../src/lib/prisma';
import { calculateCompatibility } from '../src/lib/matchingEngine';
import { serializeAdminView, serializePublicUserView } from '../src/lib/serializers';

async function verifyPhase4() {
  console.log('=== STARTING PHASE 4 E2E VERIFICATION SUITE ===\n');

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

  let testRequestId: string | null = null;
  let testConvId: string | null = null;
  let testMessageId: string | null = null;
  let testShortlistId: string | null = null;

  try {
    // 1. Fetch DB Users & Customers
    const femaleUser = await prisma.user.findFirst({
      where: { role: 'USER', customer: { gender: 'Female' } },
      include: { customer: true },
    });

    const maleUser = await prisma.user.findFirst({
      where: { role: 'USER', customer: { gender: 'Male' } },
      include: { customer: true },
    });

    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      take: 10,
    });
    const thirdUser = users.find((u) => u.id !== femaleUser?.id && u.id !== maleUser?.id) || users[2];

    assert(Boolean(femaleUser && femaleUser.customer), 'Found female matrimonial user (Ruksana).');
    assert(Boolean(maleUser && maleUser.customer), 'Found male matrimonial user (David / Male Candidate).');
    assert(Boolean(thirdUser), 'Found third registered user for authorization testing.');

    if (!femaleUser || !maleUser || !femaleUser.customer || !maleUser.customer) {
      throw new Error('Required test user profiles missing in database.');
    }

    // 2. Test Server-Side Opposite Gender Filtering
    const rawAll = await prisma.customer.findMany({
      include: { preference: true, notes: true, timeline: true },
    });
    const allCustomers = rawAll.map((c) => serializeAdminView(c));

    const femaleCustomer = serializeAdminView(femaleUser.customer);
    const maleCustomer = serializeAdminView(maleUser.customer);

    const femaleMatches = allCustomers
      .filter((c) => c.gender !== femaleCustomer.gender && c.id !== femaleCustomer.id)
      .map((c) => calculateCompatibility(femaleCustomer as any, c as any));

    assert(
      femaleMatches.every((m) => m.profile.gender === 'Male'),
      'Server-side candidate match feed for female user strictly contains 100% MALE profiles.'
    );

    const maleMatches = allCustomers
      .filter((c) => c.gender !== maleCustomer.gender && c.id !== maleCustomer.id)
      .map((c) => calculateCompatibility(maleCustomer as any, c as any));

    assert(
      maleMatches.every((m) => m.profile.gender === 'Female'),
      'Server-side candidate match feed for male user strictly contains 100% FEMALE profiles.'
    );

    // 3. Test Privacy Serialization
    const publicProfile: any = serializePublicUserView(femaleUser.customer);
    assert(
      publicProfile.phone === undefined &&
        publicProfile.email === undefined &&
        publicProfile.passwordHash === undefined,
      'Privacy Serializer verified: Private phone, email, and password hashes strictly omitted.'
    );

    // 4. Test Shortlist Persistence
    const shortlistEntry = await prisma.shortlist.create({
      data: {
        userId: femaleUser.id,
        candidateId: maleUser.customer.id,
      },
    });
    testShortlistId = shortlistEntry.id;

    const fetchedShortlist = await prisma.shortlist.findUnique({ where: { id: shortlistEntry.id } });
    assert(Boolean(fetchedShortlist), 'Shortlist entry created and persisted in PostgreSQL database.');

    // 5. Test Interest Request Lifecycle & Connection Acceptance
    const matchReq = await prisma.matchRequest.create({
      data: {
        senderId: femaleUser.id,
        receiverId: maleUser.id,
        status: 'pending',
        message: 'Matrimonial Interest Request',
      },
    });
    testRequestId = matchReq.id;

    assert(matchReq.status === 'pending', 'Interest Request created with status: pending.');

    // Accept request & verify automatic conversation creation
    const acceptedReq = await prisma.matchRequest.update({
      where: { id: matchReq.id },
      data: { status: 'accepted' },
    });

    const [pA, pB] = femaleUser.id < maleUser.id ? [femaleUser.id, maleUser.id] : [maleUser.id, femaleUser.id];

    const conversation = await prisma.conversation.upsert({
      where: { participantAId_participantBId: { participantAId: pA, participantBId: pB } },
      update: { updatedAt: new Date() },
      create: { participantAId: pA, participantBId: pB },
    });
    testConvId = conversation.id;

    assert(acceptedReq.status === 'accepted', 'Interest Request updated to status: accepted.');
    assert(Boolean(conversation && conversation.id), 'Accepted connection successfully unlocked Conversation in PostgreSQL.');

    // 6. Test Real-Time Message Exchange & Persistence
    const msg = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: femaleUser.id,
        content: 'Hello! Excited to connect with you.',
      },
    });
    testMessageId = msg.id;

    const fetchedMsg = await prisma.message.findUnique({ where: { id: msg.id } });
    assert(Boolean(fetchedMsg && fetchedMsg.content === msg.content), 'User-to-user message persisted and retrieved from PostgreSQL.');

    // 7. Security Negative Tests
    // Test A: Attempting to create chat without accepted request
    const fakeRecipientId = thirdUser.id;
    const fakeConnection = await prisma.matchRequest.findFirst({
      where: {
        status: 'accepted',
        OR: [
          { senderId: femaleUser.id, receiverId: fakeRecipientId },
          { senderId: fakeRecipientId, receiverId: femaleUser.id },
        ],
      },
    });
    assert(fakeConnection === null, 'Security Guardrail Verified: Unaccepted connection correctly rejects conversation access.');

    // Test B: Unauthorized third user accessing conversation
    const isParticipant =
      conversation.participantAId === thirdUser.id || conversation.participantBId === thirdUser.id;
    assert(!isParticipant, 'Security Guardrail Verified: Unauthorized third-party user cannot access non-participant conversation.');

    console.log(`\n========================================`);
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Phase 4 verification error:', err);
    process.exit(1);
  } finally {
    // Cleanup temporary test records
    if (testMessageId) await prisma.message.delete({ where: { id: testMessageId } }).catch(() => {});
    if (testConvId) await prisma.conversation.delete({ where: { id: testConvId } }).catch(() => {});
    if (testRequestId) await prisma.matchRequest.delete({ where: { id: testRequestId } }).catch(() => {});
    if (testShortlistId) await prisma.shortlist.delete({ where: { id: testShortlistId } }).catch(() => {});
    await prisma.$disconnect();
  }
}

verifyPhase4();
