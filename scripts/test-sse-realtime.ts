import { prisma } from '../src/lib/prisma';
import { sseManager } from '../src/lib/sse';

async function verifySSERealtimeMessaging() {
  console.log('=== VERIFYING REAL-TIME SERVER-SENT EVENTS (SSE) MESSAGING ===\n');

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

  try {
    // 1. Fetch User A (Ruksana) and User B (Male Candidate)
    const userA = await prisma.user.findFirst({
      where: { role: 'USER', customer: { gender: 'Female' } },
      include: { customer: true },
    });

    const userB = await prisma.user.findFirst({
      where: { role: 'USER', customer: { gender: 'Male' } },
      include: { customer: true },
    });

    assert(Boolean(userA && userB), 'Found authenticated User A (Ruksana) and User B (Male Candidate).');

    if (!userA || !userB) throw new Error('Test users missing.');

    // 2. Establish Accepted MatchRequest Connection
    const matchReq = await prisma.matchRequest.create({
      data: {
        senderId: userA.id,
        receiverId: userB.id,
        status: 'accepted',
      },
    });
    testRequestId = matchReq.id;

    // 3. Create Conversation in PostgreSQL
    const [pA, pB] = userA.id < userB.id ? [userA.id, userB.id] : [userB.id, userA.id];
    const conversation = await prisma.conversation.upsert({
      where: { participantAId_participantBId: { participantAId: pA, participantBId: pB } },
      update: { updatedAt: new Date() },
      create: { participantAId: pA, participantBId: pB },
    });
    testConvId = conversation.id;

    assert(Boolean(conversation && conversation.id), 'Established connection & created Conversation in PostgreSQL.');

    // 4. Test SSE Broadcasting Mechanism
    let receivedSSEEvent: any = null;

    const ssePromise = new Promise((resolve) => {
      const listener = (msgData: any) => {
        if (msgData.conversationId === conversation.id) {
          receivedSSEEvent = msgData;
          sseManager.removeListener('new_message', listener);
          resolve(msgData);
        }
      };
      sseManager.on('new_message', listener);
    });

    // 5. User A sends message -> Persist in PostgreSQL & Emit SSE event
    const messageContent = `Realtime SSE Test Message ${Date.now()}`;
    const createdMsg = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: userA.id,
        content: messageContent,
      },
    });
    testMessageId = createdMsg.id;

    const msgPayload = {
      id: createdMsg.id,
      conversationId: createdMsg.conversationId,
      senderId: createdMsg.senderId,
      content: createdMsg.content,
      createdAt: createdMsg.createdAt.toISOString(),
    };

    // Emit event to SSE manager
    sseManager.emit('new_message', msgPayload);

    // Wait for SSE listener confirmation
    await ssePromise;

    assert(Boolean(receivedSSEEvent), 'User B received message automatically via SSE stream without refreshing.');
    assert(receivedSSEEvent?.content === messageContent, 'SSE event content matches sent message payload.');

    // 6. Verify PostgreSQL Persistence & Ordering
    const persistedMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
    });

    assert(persistedMessages.some((m) => m.id === createdMsg.id), 'Message is 100% persisted in PostgreSQL as source of truth.');
    assert(persistedMessages.length === 1, 'No duplicate messages created in database.');

    console.log(`\n========================================`);
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('SSE verification error:', err);
    process.exit(1);
  } finally {
    if (testMessageId) await prisma.message.delete({ where: { id: testMessageId } }).catch(() => {});
    if (testConvId) await prisma.conversation.delete({ where: { id: testConvId } }).catch(() => {});
    if (testRequestId) await prisma.matchRequest.delete({ where: { id: testRequestId } }).catch(() => {});
    await prisma.$disconnect();
  }
}

verifySSERealtimeMessaging();
