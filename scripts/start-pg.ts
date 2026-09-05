import embeddedPostgres from 'embedded-postgres';

async function start() {
  console.log('🚀 Starting local PostgreSQL server via embedded-postgres...');
  const pg = new embeddedPostgres({
    port: 5432,
    databaseDir: './.pgdata',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await pg.initialise();
  } catch {
    // Already initialised
  }

  await pg.start();
  console.log('✅ PostgreSQL server is running at localhost:5432 (DB: matchmaker)');
}

start().catch(console.error);
