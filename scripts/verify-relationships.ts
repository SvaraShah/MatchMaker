import { prisma } from '../src/lib/prisma';

async function checkRelationships() {
  console.log('=== CHECKING POSTGRESQL RELATIONSHIP TABLES ===');

  const matches = await prisma.match.findMany({ take: 5 });
  const requests = await prisma.matchRequest.findMany({ take: 5 });
  const shortlists = await prisma.shortlist.findMany({ take: 5 });

  console.log(`Matches count in DB: ${matches.length}`);
  console.log(`MatchRequests count in DB: ${requests.length}`);
  console.log(`Shortlists count in DB: ${shortlists.length}`);

  if (matches.length > 0) {
    console.log('Sample Match:', matches[0]);
  }
  if (requests.length > 0) {
    console.log('Sample MatchRequest:', requests[0]);
  }
  if (shortlists.length > 0) {
    console.log('Sample Shortlist:', shortlists[0]);
  }

  await prisma.$disconnect();
}

checkRelationships();
