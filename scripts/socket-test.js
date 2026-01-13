const { io } = require('socket.io-client');
const https = require('https');

const URL = process.env.SOCKET_TEST_URL || 'https://eyyback.vercel.app';

function runTest(name, opts) {
  return new Promise((resolve) => {
    console.log(`\n--- ${name} ---`);
    const socket = io(URL, Object.assign({ autoConnect: false, timeout: 5000, reconnection: false }, opts));

    const timer = setTimeout(() => {
      console.log(`[${name}] Timeout after 6s`);
      socket.close();
      resolve({ ok: false, reason: 'timeout' });
    }, 6000);

    socket.on('connect', () => {
      clearTimeout(timer);
      console.log(`[${name}] connected (id=${socket.id})`);
      socket.close();
      resolve({ ok: true });
    });

    socket.on('connect_error', (err) => {
      clearTimeout(timer);
      console.log(`[${name}] connect_error:`, err && err.message ? err.message : String(err));
      if (err && err._transport && err._transport.name) {
        console.log(`[${name}] transport:`, err._transport.name);
      }
      socket.close();
      resolve({ ok: false, reason: err && err.message ? err.message : String(err) });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[${name}] disconnected:`, reason);
    });

    try {
      socket.connect();
    } catch (e) {
      clearTimeout(timer);
      console.log(`[${name}] exception:`, e && e.message ? e.message : String(e));
      resolve({ ok: false, reason: String(e) });
    }
  });
}

(async () => {
  console.log('Testing socket.io endpoint:', URL);
  // 1. Polling only
  await runTest('Polling-only', { transports: ['polling'] });
  // 2. WebSocket only
  await runTest('WebSocket-only', { transports: ['websocket'] });
  // 3. Default (polling, websocket)
  await runTest('Default', { transports: ['polling', 'websocket'] });

  // 4. Curl-like HTTP polling probe
  console.log('\n--- HTTP polling probe (curl-like) ---');
  const path = '/socket.io/?EIO=4&transport=polling&t=' + Date.now();
  const opts = { method: 'GET', timeout: 5000 };
  const req = https.request(URL + path, opts, (res) => {
    console.log('HTTP probe status:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => data += chunk.toString());
    res.on('end', () => {
      console.log('HTTP probe body (truncated):', data.slice(0, 200));
      process.exit(0);
    });
  });
  req.on('error', (err) => {
    console.log('HTTP probe error:', err.message);
    process.exit(0);
  });
  req.on('timeout', () => {
    console.log('HTTP probe timeout');
    req.destroy();
  });
  req.end();
})();