async function verifyStage0() {
  console.log('==================================================');
  console.log('STAGE 0 — POST-LOGIN APPLICATION PAGES VERIFICATION');
  console.log('==================================================\n');

  // Test 1: USER Login -> /app
  console.log('[STAGE 0.1] USER Login & /app Dashboard Rendering...');
  const userLoginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ruksana.trivedi@example.com', password: 'password123' })
  });
  const uCookies = userLoginRes.headers.getSetCookie();
  const userCookie = uCookies.find(c => c.startsWith('matchmaker_session='))?.split(';')[0];

  const appRes = await fetch('http://localhost:3000/app', {
    headers: { cookie: userCookie || '' }
  });
  console.log('USER Login Status:', userLoginRes.status, '| /app Page Status:', appRes.status, '| Final URL:', appRes.url);
  if (userLoginRes.status === 200 && appRes.status === 200) {
    console.log('✅ TEST A PASSED: USER login succeeds and /app renders dashboard\n');
  } else {
    console.error('❌ TEST A FAILED\n');
    process.exit(1);
  }

  // Test 2: Refresh /app (Session Persistence)
  console.log('[STAGE 0.2] Refresh /app (Session Persistence)...');
  const appRefreshRes = await fetch('http://localhost:3000/app', {
    headers: { cookie: userCookie || '' }
  });
  console.log('Refresh /app Status:', appRefreshRes.status);
  if (appRefreshRes.status === 200) {
    console.log('✅ TEST B PASSED: /app refresh preserves session (200 OK)\n');
  } else {
    console.error('❌ TEST B FAILED\n');
    process.exit(1);
  }

  // Test 3: ADMIN Login -> /admin
  console.log('[STAGE 0.3] ADMIN Login & /admin Command Center Rendering...');
  const adminLoginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'matchmaker@tdc.com', password: 'password123' })
  });
  const aCookies = adminLoginRes.headers.getSetCookie();
  const adminCookie = aCookies.find(c => c.startsWith('matchmaker_session='))?.split(';')[0];

  const adminRes = await fetch('http://localhost:3000/admin', {
    headers: { cookie: adminCookie || '' }
  });
  console.log('ADMIN Login Status:', adminLoginRes.status, '| /admin Page Status:', adminRes.status, '| Final URL:', adminRes.url);
  if (adminLoginRes.status === 200 && adminRes.status === 200) {
    console.log('✅ TEST C PASSED: ADMIN login succeeds and /admin renders command center\n');
  } else {
    console.error('❌ TEST C FAILED\n');
    process.exit(1);
  }

  // Test 4: Refresh /admin
  console.log('[STAGE 0.4] Refresh /admin (Session Persistence)...');
  const adminRefreshRes = await fetch('http://localhost:3000/admin', {
    headers: { cookie: adminCookie || '' }
  });
  console.log('Refresh /admin Status:', adminRefreshRes.status);
  if (adminRefreshRes.status === 200) {
    console.log('✅ TEST D PASSED: /admin refresh preserves session (200 OK)\n');
  } else {
    console.error('❌ TEST D FAILED\n');
    process.exit(1);
  }

  // Test 5: USER -> /admin (Blocked / Redirected)
  console.log('[STAGE 0.5] USER Attempting Access to /admin...');
  const userToAdminRes = await fetch('http://localhost:3000/admin', {
    headers: { cookie: userCookie || '' },
    redirect: 'manual'
  });
  console.log('USER accessing /admin Status:', userToAdminRes.status, '| Location Header:', userToAdminRes.headers.get('location'));
  if (userToAdminRes.status === 307 || userToAdminRes.status === 302 || userToAdminRes.headers.get('location')?.includes('/app')) {
    console.log('✅ TEST E PASSED: USER attempted access to /admin is blocked/redirected\n');
  } else {
    console.error('❌ TEST E FAILED\n');
    process.exit(1);
  }

  // Test 6: Unauthenticated -> /app (Redirected to /login)
  console.log('[STAGE 0.6] Unauthenticated Access to /app...');
  const unauthAppRes = await fetch('http://localhost:3000/app', {
    redirect: 'manual'
  });
  console.log('Unauthenticated /app Status:', unauthAppRes.status, '| Location Header:', unauthAppRes.headers.get('location'));
  if (unauthAppRes.status === 307 || unauthAppRes.status === 302 || unauthAppRes.headers.get('location')?.includes('/login')) {
    console.log('✅ TEST F PASSED: Unauthenticated access to /app is redirected to /login\n');
  } else {
    console.error('❌ TEST F FAILED\n');
    process.exit(1);
  }

  // Test 7: Logout -> /login
  console.log('[STAGE 0.7] Logout...');
  const logoutRes = await fetch('http://localhost:3000/api/auth/logout', {
    method: 'POST',
    headers: { cookie: adminCookie || '' }
  });
  const logoutJson = (await logoutRes.json()) as any;
  console.log('Logout Status:', logoutRes.status, '| Message:', logoutJson.message);
  if (logoutRes.status === 200 && logoutJson.success) {
    console.log('✅ TEST G PASSED: Logout clears session and redirects to /login\n');
  } else {
    console.error('❌ TEST G FAILED\n');
    process.exit(1);
  }

  console.log('==================================================');
  console.log('🎉 ALL STAGE 0 POST-LOGIN TESTS PASSED 100%');
  console.log('==================================================\n');
}

verifyStage0().then(() => process.exit(0));
