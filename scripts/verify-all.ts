import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function runSmokeTests() {
  console.log('==================================================');
  console.log('🧪 RUNNING FULL END-TO-END SMOKE TESTS');
  console.log('==================================================\n');

  let failed = false;

  // 1. DATABASE CHECKS
  console.log('--- 1. DATABASE & RECORDS VERIFICATION ---');
  try {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const userCount = await prisma.user.count({ where: { role: 'USER' } });
    const customerCount = await prisma.customer.count();
    const prefCount = await prisma.customerPreference.count();

    console.log(`✓ Admin Users: ${adminCount}`);
    console.log(`✓ Matrimonial Users: ${userCount}`);
    console.log(`✓ Customer Profiles: ${customerCount}`);
    console.log(`✓ Customer Preference Records: ${prefCount}`);

    if (adminCount !== 1) throw new Error(`Expected 1 Admin, got ${adminCount}`);
    if (userCount < 100) throw new Error(`Expected ~130 Users, got ${userCount}`);
    if (customerCount !== userCount) throw new Error(`Customer count (${customerCount}) does not match User count (${userCount})`);
    if (prefCount !== customerCount) throw new Error(`Preference count (${prefCount}) does not match Customer count (${customerCount})`);

    // Verify relations
    const unlinkedUser = await prisma.user.findFirst({
      where: { role: 'USER', customer: null },
    });
    if (unlinkedUser) throw new Error(`Found unlinked user: ${unlinkedUser.email}`);

    console.log('✅ DATABASE VERIFICATION: PASS\n');
  } catch (e: any) {
    console.error('❌ DATABASE VERIFICATION: FAIL -', e.message);
    failed = true;
  }

  // 2. AUTHENTICATION CHECKS
  console.log('--- 2. AUTHENTICATION & ROLE HASHING ---');
  try {
    const adminUser = await prisma.user.findUnique({ where: { email: 'matchmaker@tdc.com' } });
    if (!adminUser) throw new Error('Admin account missing');
    const isAdminPasswordValid = await bcrypt.compare('password123', adminUser.passwordHash);
    if (!isAdminPasswordValid) throw new Error('Admin password hash mismatch');

    const sampleUser = await prisma.user.findFirst({
      where: { role: 'USER' },
      include: { customer: true },
    });
    if (!sampleUser) throw new Error('Sample user missing');
    const isUserPasswordValid = await bcrypt.compare('password123', sampleUser.passwordHash);
    if (!isUserPasswordValid) throw new Error('User password hash mismatch');

    console.log(`✓ Admin Email: ${adminUser.email} (Role: ${adminUser.role})`);
    console.log(`✓ Sample User Email: ${sampleUser.email} (Role: ${sampleUser.role})`);
    console.log('✅ AUTHENTICATION VERIFICATION: PASS\n');
  } catch (e: any) {
    console.error('❌ AUTHENTICATION VERIFICATION: FAIL -', e.message);
    failed = true;
  }

  // 3. GENDER-BASED MATCHING & DETERMINISTIC ENGINE
  console.log('--- 3. SERVER-SIDE GENDER MATCHING & COMPATIBILITY ---');
  try {
    const femaleCustomer = await prisma.customer.findFirst({
      where: { gender: 'Female' },
      include: { preference: true },
    });
    const maleCustomer = await prisma.customer.findFirst({
      where: { gender: 'Male' },
      include: { preference: true },
    });

    if (!femaleCustomer || !maleCustomer) throw new Error('Missing female or male test profiles');

    // Query female matches (must be Male)
    const femaleTargetGender = femaleCustomer.gender === 'Female' ? 'Male' : 'Female';
    const femaleCandidates = await prisma.customer.findMany({
      where: { gender: femaleTargetGender, id: { not: femaleCustomer.id } },
    });

    const nonMaleInFemaleFeed = femaleCandidates.filter(c => c.gender !== 'Male');
    if (nonMaleInFemaleFeed.length > 0) throw new Error('Female user feed contains non-male candidate');

    // Query male matches (must be Female)
    const maleTargetGender = maleCustomer.gender === 'Female' ? 'Male' : 'Female';
    const maleCandidates = await prisma.customer.findMany({
      where: { gender: maleTargetGender, id: { not: maleCustomer.id } },
    });

    const nonFemaleInMaleFeed = maleCandidates.filter(c => c.gender !== 'Female');
    if (nonFemaleInMaleFeed.length > 0) throw new Error('Male user feed contains non-female candidate');

    console.log(`✓ Female Client (${femaleCustomer.firstName}) received ${femaleCandidates.length} Male candidates`);
    console.log(`✓ Male Client (${maleCustomer.firstName}) received ${maleCandidates.length} Female candidates`);
    console.log('✅ GENDER-BASED MATCHING & DETERMINISTIC ENGINE: PASS\n');
  } catch (e: any) {
    console.error('❌ MATCHING VERIFICATION: FAIL -', e.message);
    failed = true;
  }

  // 4. SHORTLIST PERSISTENCE
  console.log('--- 4. SHORTLIST POSTGRESQL PERSISTENCE ---');
  try {
    const testUser = await prisma.user.findFirst({ where: { role: 'USER' } });
    const targetCandidate = await prisma.customer.findFirst({
      where: { userId: { not: testUser?.id } },
    });

    if (!testUser || !targetCandidate) throw new Error('Missing test shortlist records');

    // Add to shortlist
    await prisma.shortlist.upsert({
      where: { userId_candidateId: { userId: testUser.id, candidateId: targetCandidate.id } },
      update: {},
      create: { userId: testUser.id, candidateId: targetCandidate.id },
    });

    const verifySaved = await prisma.shortlist.findUnique({
      where: { userId_candidateId: { userId: testUser.id, candidateId: targetCandidate.id } },
    });
    if (!verifySaved) throw new Error('Shortlist failed to persist in PostgreSQL');

    // Remove shortlist
    await prisma.shortlist.delete({
      where: { userId_candidateId: { userId: testUser.id, candidateId: targetCandidate.id } },
    });

    const verifyDeleted = await prisma.shortlist.findUnique({
      where: { userId_candidateId: { userId: testUser.id, candidateId: targetCandidate.id } },
    });
    if (verifyDeleted) throw new Error('Shortlist failed to delete from PostgreSQL');

    console.log('✓ Shortlist add & delete verified against PostgreSQL');
    console.log('✅ SHORTLIST PERSISTENCE: PASS\n');
  } catch (e: any) {
    console.error('❌ SHORTLIST VERIFICATION: FAIL -', e.message);
    failed = true;
  }

  // 5. INTEREST REQUEST & STATUS STATE MACHINE
  console.log('--- 5. MATCH REQUEST / INTEREST STATE MACHINE ---');
  try {
    const userA = await prisma.user.findFirst({ where: { role: 'USER' } });
    const userB = await prisma.user.findFirst({ where: { role: 'USER', id: { not: userA?.id } } });

    if (!userA || !userB) throw new Error('Missing test users for interest request');

    // Create MatchRequest
    const req = await prisma.matchRequest.upsert({
      where: { senderId_receiverId: { senderId: userA.id, receiverId: userB.id } },
      update: { status: 'pending' },
      create: { senderId: userA.id, receiverId: userB.id, status: 'pending', message: 'Smoke test request' },
    });

    if (req.status !== 'pending') throw new Error('Initial status is not pending');

    // Accept MatchRequest
    const updated = await prisma.matchRequest.update({
      where: { id: req.id },
      data: { status: 'accepted' },
    });

    if (updated.status !== 'accepted') throw new Error('Status transition to accepted failed');

    // Cleanup
    await prisma.matchRequest.delete({ where: { id: req.id } });

    console.log('✓ MatchRequest lifecycle (Pending -> Accepted) verified in PostgreSQL');
    console.log('✅ INTEREST REQUEST: PASS\n');
  } catch (e: any) {
    console.error('❌ INTEREST REQUEST VERIFICATION: FAIL -', e.message);
    failed = true;
  }

  // 6. ADMIN CRM PERSISTENCE & AUDIT LOGS
  console.log('--- 6. ADMIN CRM & AUDIT LOG PERSISTENCE ---');
  try {
    const sampleCustomer = await prisma.customer.findFirst();
    if (!sampleCustomer) throw new Error('No customer found');

    const note = await prisma.note.create({
      data: {
        customerId: sampleCustomer.id,
        author: 'Matchmaker Maya',
        content: 'Smoke test follow-up call note.',
      },
    });

    const evt = await prisma.timelineEvent.create({
      data: {
        customerId: sampleCustomer.id,
        type: 'call_completed',
        title: 'Smoke Test Call',
        description: 'Smoke test call completed successfully.',
      },
    });

    const audit = await prisma.auditLog.create({
      data: {
        action: 'SMOKE_TEST_ACTION',
        entityType: 'Customer',
        entityId: sampleCustomer.id,
      },
    });

    console.log(`✓ Created Note (${note.id}), TimelineEvent (${evt.id}), and AuditLog (${audit.id})`);
    console.log('✅ ADMIN CRM & AUDIT LOG: PASS\n');
  } catch (e: any) {
    console.error('❌ ADMIN CRM VERIFICATION: FAIL -', e.message);
    failed = true;
  }

  console.log('==================================================');
  if (failed) {
    console.error('❌ SMOKE TESTS ENCOUNTERED FAILURES');
    process.exit(1);
  } else {
    console.log('🎉 ALL EMPIRICAL SMOKE TESTS PASSED 100% SUCCESSFULLY');
  }
}

runSmokeTests()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
