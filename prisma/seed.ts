import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed process...');

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Admin Account
  const adminEmail = 'matchmaker@tdc.com';
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Matchmaker Maya',
      role: 'ADMIN',
      passwordHash: defaultPasswordHash,
    },
    create: {
      email: adminEmail,
      name: 'Matchmaker Maya',
      role: 'ADMIN',
      passwordHash: defaultPasswordHash,
    },
  });

  console.log(`✅ Admin account seeded: ${adminUser.email} (Role: ADMIN)`);

  // 2. Read existing db.json dataset
  const dbJsonPath = path.join(process.cwd(), 'src/data/db.json');
  if (!fs.existsSync(dbJsonPath)) {
    console.warn('⚠️ src/data/db.json not found. Skipping profile migration.');
    return;
  }

  const raw = fs.readFileSync(dbJsonPath, 'utf-8');
  const data = JSON.parse(raw);
  const customers = data.customers || [];

  console.log(`📦 Found ${customers.length} customer profiles in db.json to seed...`);

  let count = 0;
  for (const item of customers) {
    // Generate valid email if missing or invalid
    const email = item.email && item.email.includes('@')
      ? item.email.toLowerCase()
      : `${item.firstName.toLowerCase()}.${item.lastName.toLowerCase()}@example.com`;

    // Create User record for each profile
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: `${item.firstName} ${item.lastName}`,
        role: 'USER',
      },
      create: {
        email,
        name: `${item.firstName} ${item.lastName}`,
        role: 'USER',
        passwordHash: defaultPasswordHash,
      },
    });

    // Create or update Customer profile
    const customer = await prisma.customer.upsert({
      where: { id: item.id },
      update: {
        userId: user.id,
        firstName: item.firstName,
        lastName: item.lastName,
        gender: item.gender,
        dob: item.dob || new Date('1995-01-01').toISOString(),
        age: item.age,
        country: item.country || 'India',
        city: item.city,
        height: item.height || 170,
        religion: item.religion,
        caste: item.caste,
        motherTongue: item.motherTongue || 'Hindi',
        languagesKnown: JSON.stringify(item.languagesKnown || ['English', 'Hindi']),
        email: email,
        phone: item.phone || '+91 98765 43210',
        undergradCollege: item.education?.undergradCollege || 'University of Delhi',
        degree: item.education?.degree || 'B.Tech',
        postgradDegree: item.education?.postgradDegree || null,
        company: item.profession?.company || 'Enterprise',
        designation: item.profession?.designation || 'Consultant',
        income: item.profession?.income || 25,
        industry: item.profession?.industry || 'Technology',
        siblings: item.family?.siblings || 0,
        familyType: item.family?.familyType || 'Nuclear',
        parentsOccupation: item.family?.parentsOccupation || 'Service',
        smoking: item.lifestyle?.smoking || 'No',
        drinking: item.lifestyle?.drinking || 'No',
        diet: item.lifestyle?.diet || 'Vegetarian',
        openToPets: Boolean(item.lifestyle?.openToPets),
        journeyStatus: item.journeyStatus || 'New Lead',
        lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : new Date(),
      },
      create: {
        id: item.id,
        userId: user.id,
        firstName: item.firstName,
        lastName: item.lastName,
        gender: item.gender,
        dob: item.dob || new Date('1995-01-01').toISOString(),
        age: item.age,
        country: item.country || 'India',
        city: item.city,
        height: item.height || 170,
        religion: item.religion,
        caste: item.caste,
        motherTongue: item.motherTongue || 'Hindi',
        languagesKnown: JSON.stringify(item.languagesKnown || ['English', 'Hindi']),
        email: email,
        phone: item.phone || '+91 98765 43210',
        undergradCollege: item.education?.undergradCollege || 'University of Delhi',
        degree: item.education?.degree || 'B.Tech',
        postgradDegree: item.education?.postgradDegree || null,
        company: item.profession?.company || 'Enterprise',
        designation: item.profession?.designation || 'Consultant',
        income: item.profession?.income || 25,
        industry: item.profession?.industry || 'Technology',
        siblings: item.family?.siblings || 0,
        familyType: item.family?.familyType || 'Nuclear',
        parentsOccupation: item.family?.parentsOccupation || 'Service',
        smoking: item.lifestyle?.smoking || 'No',
        drinking: item.lifestyle?.drinking || 'No',
        diet: item.lifestyle?.diet || 'Vegetarian',
        openToPets: Boolean(item.lifestyle?.openToPets),
        journeyStatus: item.journeyStatus || 'New Lead',
        lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : new Date(),
      },
    });

    // Create Preference record
    if (item.preferences) {
      await prisma.customerPreference.upsert({
        where: { customerId: customer.id },
        update: {
          ageMin: item.preferences.ageMin || 21,
          ageMax: item.preferences.ageMax || 40,
          locations: JSON.stringify(item.preferences.locations || [item.city]),
          religions: JSON.stringify(item.preferences.religions || [item.religion]),
          castes: JSON.stringify(item.preferences.castes || ['Any']),
          wantKids: item.preferences.wantKids || 'Open',
          openToRelocate: item.preferences.openToRelocate || 'Depends',
          horoscopeRequired: Boolean(item.preferences.horoscopeRequired),
          manglikStatus: item.preferences.manglikStatus || 'Any',
        },
        create: {
          customerId: customer.id,
          ageMin: item.preferences.ageMin || 21,
          ageMax: item.preferences.ageMax || 40,
          locations: JSON.stringify(item.preferences.locations || [item.city]),
          religions: JSON.stringify(item.preferences.religions || [item.religion]),
          castes: JSON.stringify(item.preferences.castes || ['Any']),
          wantKids: item.preferences.wantKids || 'Open',
          openToRelocate: item.preferences.openToRelocate || 'Depends',
          horoscopeRequired: Boolean(item.preferences.horoscopeRequired),
          manglikStatus: item.preferences.manglikStatus || 'Any',
        },
      });
    }

    // Migration of existing Notes
    if (Array.isArray(item.notes)) {
      for (const note of item.notes) {
        await prisma.note.create({
          data: {
            id: note.id,
            customerId: customer.id,
            author: note.author || 'System',
            content: note.content,
            createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
          },
        }).catch(() => {
          // ignore duplicate note creation on re-run
        });
      }
    }

    // Migration of existing Timeline Events
    if (Array.isArray(item.timeline)) {
      for (const evt of item.timeline) {
        await prisma.timelineEvent.create({
          data: {
            id: evt.id,
            customerId: customer.id,
            type: evt.type,
            title: evt.title,
            description: evt.description,
            createdAt: evt.createdAt ? new Date(evt.createdAt) : new Date(),
          },
        }).catch(() => {
          // ignore duplicate timeline creation on re-run
        });
      }
    }

    count++;
  }

  console.log(`🎉 Successfully seeded ${count} profiles into PostgreSQL database.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
