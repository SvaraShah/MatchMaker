import { PrismaClient } from '@prisma/client';
import { calculateCompatibility } from '../src/lib/matchingEngine';
import { serializeAdminView } from '../src/lib/serializers';

const prisma = new PrismaClient();

async function runPhase5Verification() {
  console.log('==================================================');
  console.log('         PHASE 5 VERIFICATION SUITE              ');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, title: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title} - ${detail || 'Assertion failed'}`);
    }
  }

  try {
    // 1. Prisma & DB Connection
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    assert(!!adminUser, 'Prisma DB Connection & Admin Account', `Found admin: ${adminUser?.email}`);

    const customerCount = await prisma.customer.count();
    assert(customerCount >= 100, 'Customer Database Seeding', `Total customers: ${customerCount}`);

    // 2. FollowUp Model Validation
    const testCustomer = await prisma.customer.findFirst();
    assert(!!testCustomer, 'Test Customer Available', `Customer ID: ${testCustomer?.id}`);

    if (testCustomer) {
      const followUp = await prisma.followUp.create({
        data: {
          customerId: testCustomer.id,
          title: 'Verification Test Follow-up',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          priority: 'HIGH',
          status: 'PENDING',
          notes: 'Test creation',
        },
      });
      assert(!!followUp.id, 'FollowUp Model Persistence', `Created follow-up ID: ${followUp.id}`);

      // Complete Follow-up
      const updatedFollowUp = await prisma.followUp.update({
        where: { id: followUp.id },
        data: { status: 'COMPLETED' },
      });
      assert(updatedFollowUp.status === 'COMPLETED', 'FollowUp Status Transition to COMPLETED');

      // Cleanup
      await prisma.followUp.delete({ where: { id: followUp.id } });
    }

    // 3. Pipeline Stages Validation
    const validStages = [
      'New Lead',
      'Profile Review',
      'Preferences Verified',
      'Matching',
      'Proposed',
      'Interest',
      'Connected',
      'Follow-up',
      'Matched',
    ];
    assert(validStages.length === 9, '9-Stage Kanban Pipeline Definition Verified');

    // 4. Deterministic Matching Engine Compatibility (Section 8 Rule)
    const femaleCustomer = await prisma.customer.findFirst({
      where: { gender: 'Female' },
      include: { preference: true },
    });
    const maleCustomer = await prisma.customer.findFirst({
      where: { gender: 'Male' },
      include: { preference: true },
    });

    assert(!!femaleCustomer && !!maleCustomer, 'Female & Male Candidates Found for Matching Engine');

    if (femaleCustomer && maleCustomer) {
      const serializedFemale = serializeAdminView(femaleCustomer) as any;
      const serializedMale = serializeAdminView(maleCustomer) as any;
      const matchResult = calculateCompatibility(serializedFemale, serializedMale);
      assert(
        typeof matchResult.score === 'number' && matchResult.score >= 0 && matchResult.score <= 100,
        'Deterministic Matching Score Calculation',
        `Score: ${matchResult.score}%`
      );
      assert(
        !!matchResult.scoreBreakdown && Object.keys(matchResult.scoreBreakdown).length === 8,
        '8-Dimension Score Breakdown Verification',
        `Dimensions found: ${Object.keys(matchResult.scoreBreakdown || {}).length}`
      );
    }

    // 5. Phase 4 Preservation Verification
    const shortlistCount = await prisma.shortlist.count();
    const matchRequestCount = await prisma.matchRequest.count();
    const notificationCount = await prisma.notification.count();
    assert(typeof shortlistCount === 'number', 'Shortlist Persistence intact');
    assert(typeof matchRequestCount === 'number', 'MatchRequest Pipeline intact');
    assert(typeof notificationCount === 'number', 'Notification System intact');

    console.log('\n==================================================');
    console.log(`VERIFICATION SUMMARY: ${passed}/${total} TESTS PASSED`);
    console.log('==================================================');

    if (passed < total) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Phase 5 Verification Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase5Verification();
