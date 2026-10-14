const http = require('http');
const fs = require('fs');
const path = require('path');
const syncpay = require('./syncpay');

let PORT = parseInt(process.env.PORT || '3030', 10);
const PUBLIC_DIR = path.join(__dirname, 'site');
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure process doesn't exit on uncaught stream or connection drops
process.on('uncaughtException', (err) => {
  if (err.code === 'ECONNRESET' || err.code === 'EPIPE' || err.code === 'ERR_STREAM_PREMATURE_CLOSE') {
    // Normal browser disconnection during media streaming or page reload
    return;
  }
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function getUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving users:', e);
  }
}

const server = http.createServer((req, res) => {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Safety Redirect: intercept any legacy Sharkcash or old checkout paths
  if (pathname.includes('sharkcash') || pathname.includes('promptsvirais')) {
    res.writeHead(302, { 'Location': '/checkout' });
    res.end();
    return;
  }

  // Auth Login API (/api/auth/login)
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let data = {};
      try { data = JSON.parse(body); } catch (_) {}
      const email = (data.email || '').trim().toLowerCase();
      const password = (data.password || '').trim();

      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === email);

      if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'Acesso negado: Este e-mail não foi liberado pelo administrador.' }));
        return;
      }

      if (user.status === 'bloqueado') {
        res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'Seu acesso foi temporariamente suspenso pelo administrador.' }));
        return;
      }

      if (user.password !== password) {
        res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'Senha incorreta para este usuário.' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        ok: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan }
      }));
    });
    return;
  }

  // Admin Users Management API (/api/admin/users)
  if (pathname === '/api/admin/users') {
    if (req.method === 'GET') {
      const users = getUsers();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, users }));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        let data = {};
        try { data = JSON.parse(body); } catch (_) {}
        let users = getUsers();

        if (data.action === 'create') {
          const email = (data.user?.email || '').trim().toLowerCase();
          const password = (data.user?.password || '').trim();
          if (!email || !password) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ ok: false, error: 'E-mail e senha são obrigatórios.' }));
            return;
          }
          if (users.some(u => u.email.toLowerCase() === email)) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ ok: false, error: 'Este e-mail já está cadastrado.' }));
            return;
          }
          const newUser = {
            id: `usr_${Date.now()}`,
            name: data.user.name || 'Aluno VIP',
            email: email,
            password: password,
            role: data.user.role || 'aluno',
            plan: data.user.plan || 'Vitalício',
            status: 'ativo',
            createdAt: new Date().toISOString()
          };
          users.push(newUser);
          saveUsers(users);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: true, user: newUser }));
          return;
        }

        if (data.action === 'toggle_status') {
          const u = users.find(x => x.id === data.id);
          if (u) {
            u.status = u.status === 'ativo' ? 'bloqueado' : 'ativo';
            saveUsers(users);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ ok: true, user: u }));
            return;
          }
        }

        if (data.action === 'delete') {
          users = users.filter(x => x.id !== data.id);
          saveUsers(users);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'Ação inválida.' }));
      });
      return;
    }
  }

  // SyncPay Checkout API: Generate Pix (/api/checkout/pix)
  if (pathname === '/api/checkout/pix' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      let data = {};
      try { data = JSON.parse(body); } catch (_) {}

      const name = (data.name || '').trim();
      const email = (data.email || '').trim().toLowerCase();
      const phone = (data.phone || '').trim();
      const cpf = (data.cpf || '').trim();
      const plan = (data.plan || 'vip').trim().toLowerCase();
      const isCoupon = (data.coupon || '').trim().toUpperCase() === 'FABRICADEUGC';

      let amount = 147.00;
      let planName = 'VIP Vitalício';

      if (plan === 'basic') {
        amount = 67.90;
        planName = 'Plano Básico';
      } else {
        amount = isCoupon ? 147.00 : 197.90;
        planName = 'VIP Vitalício';
      }

      const host = req.headers.host || `localhost:${PORT}`;
      const proto = req.headers['x-forwarded-proto'] || 'http';
      const webhookUrl = `${proto}://${host}/api/webhook/syncpay`;

      try {
        const result = await syncpay.createPixCharge({
          amount: amount,
          description: `Prompts Virais — ${planName}`,
          name: name || 'Aluno VIP',
          email: email || 'cliente@email.com',
          phone: phone || '11999999999',
          cpf: cpf || '00000000000',
          plan: plan,
          webhookUrl: webhookUrl
        });

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error('Error in /api/checkout/pix:', err);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'Erro ao gerar Pix: ' + err.message }));
      }
    });
    return;
  }

  // SyncPay Checkout API: Check Payment Status (/api/checkout/status)
  if (pathname === '/api/checkout/status' && req.method === 'GET') {
    const id = parsedUrl.searchParams.get('id') || '';
    const email = (parsedUrl.searchParams.get('email') || '').trim().toLowerCase();
    const force = parsedUrl.searchParams.get('force') === '1';

    (async () => {
      try {
        const check = await syncpay.checkTransactionStatus(id, force);

        if (check.paid) {
          // Ensure user account exists in users database
          let users = getUsers();
          let user = users.find(u => u.email.toLowerCase() === email);

          if (!user) {
            // Generate auto credentials for approved student
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let pass = 'PV-';
            for (let i = 0; i < 6; i++) pass += chars[Math.floor(Math.random() * chars.length)];

            user = {
              id: `usr_${Date.now()}`,
              name: (check.tx && check.tx.client && check.tx.client.name) || 'Aluno VIP',
              email: email || `aluno_${Date.now()}@prompts.com`,
              password: pass,
              role: 'aluno',
              plan: (check.tx && check.tx.client && check.tx.client.plan === 'basic') ? 'Plano Básico' : 'VIP Vitalício',
              status: 'ativo',
              createdAt: new Date().toISOString()
            };
            users.push(user);
            saveUsers(users);
          }

          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            ok: true,
            paid: true,
            user: {
              name: user.name,
              email: user.email,
              password: user.password,
              plan: user.plan
            }
          }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, paid: false, status: check.status }));
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, paid: false, error: err.message }));
      }
    })();
    return;
  }

  // SyncPay Webhook Handler (/api/webhook/syncpay)
  if (pathname === '/api/webhook/syncpay' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let data = {};
      try { data = JSON.parse(body); } catch (_) {}
      console.log('Received SyncPay Webhook event:', data);

      const hookResult = syncpay.handleSyncPayWebhook(data);

      if (hookResult.approved) {
        const clientEmail = (hookResult.tx?.client?.email || data.client?.email || data.email || '').toLowerCase().trim();
        const clientName = hookResult.tx?.client?.name || data.client?.name || 'Aluno VIP';

        if (clientEmail) {
          let users = getUsers();
          let user = users.find(u => u.email.toLowerCase() === clientEmail);
          if (!user) {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let pass = 'PV-';
            for (let i = 0; i < 6; i++) pass += chars[Math.floor(Math.random() * chars.length)];

            user = {
              id: `usr_${Date.now()}`,
              name: clientName,
              email: clientEmail,
              password: pass,
              role: 'aluno',
              plan: 'VIP Vitalício',
              status: 'ativo',
              createdAt: new Date().toISOString()
            };
            users.push(user);
            saveUsers(users);
          } else if (user.status === 'bloqueado') {
            user.status = 'ativo';
            saveUsers(users);
          }
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, received: true }));
    });
    return;
  }

  // Admin Gateway Configuration API (/api/admin/gateway)
  if (pathname === '/api/admin/gateway') {
    if (req.method === 'GET') {
      const config = syncpay.getGatewayConfig();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, config }));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        let data = {};
        try { data = JSON.parse(body); } catch (_) {}

        if (data.action === 'test_connection') {
          const testRes = await syncpay.testSyncPayConnection(
            data.client_id,
            data.client_secret,
            data.base_url || 'https://api.syncpayments.com.br'
          );
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(testRes));
          return;
        }

        const currentConfig = syncpay.getGatewayConfig();
        const updatedConfig = {
          provider: 'syncpay',
          client_id: (data.client_id !== undefined ? data.client_id : currentConfig.client_id).trim(),
          client_secret: (data.client_secret !== undefined ? data.client_secret : currentConfig.client_secret).trim(),
          base_url: (data.base_url || currentConfig.base_url || 'https://api.syncpayments.com.br').trim(),
          webhook_url: (data.webhook_url !== undefined ? data.webhook_url : currentConfig.webhook_url).trim(),
          test_mode: data.test_mode !== undefined ? Boolean(data.test_mode) : currentConfig.test_mode
        };

        const saved = syncpay.saveGatewayConfig(updatedConfig);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: saved, message: 'Configurações do SyncPay salvas com sucesso!', config: updatedConfig }));
      });
      return;
    }
  }

  // Backward-compatible Mock API for Pix Checkout (/api/create-pix)
  if (pathname === '/api/create-pix' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let data = {};
      try { data = JSON.parse(body); } catch (_) {}
      const isCoupon = (data.coupon || '').trim().toUpperCase() === 'FABRICADEUGC';
      const isVip = (data.plan || '') === 'vip';
      const amountCents = isCoupon ? 14700 : (isVip ? 19790 : 6790);

      const responsePayload = {
        ok: true,
        paymentId: `pv_${Date.now()}`,
        amountCents: amountCents,
        couponApplied: isCoupon,
        copyPaste: syncpay.generateEmvPixCode((amountCents / 100).toFixed(2), `ref_${Date.now()}`),
        qrImage: null,
        externalRef: `ref_${Date.now()}`
      };

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(responsePayload));
    });
    return;
  }

  // File resolution
  let filePath = path.join(PUBLIC_DIR, pathname);
  const requestedExt = path.extname(pathname).toLowerCase();

  // If path is a directory, look for index.html inside it
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexInDir = path.join(filePath, 'index.html');
    if (fs.existsSync(indexInDir)) {
      filePath = indexInDir;
    }
  }

  // If file doesn't exist directly and has no extension, try .html or /index.html
  if (!fs.existsSync(filePath) && !requestedExt) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    } else {
      // SPA fallback ONLY for HTML routes without file extensions
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }
  }

  // Check if file exists
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const stat = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Support Range requests (vital for video streaming and seeking)
  const range = req.headers.range;
  if (range && (ext === '.mp4' || ext === '.webm' || ext === '.mov')) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;

    if (start >= stat.size || end >= stat.size) {
      res.writeHead(416, {
        'Content-Range': `bytes */${stat.size}`
      });
      res.end();
      return;
    }

    const chunksize = (end - start) + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType
    });

    const file = fs.createReadStream(filePath, { start, end });
    file.on('error', () => {
      file.destroy();
    });
    req.on('close', () => {
      file.destroy();
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    const file = fs.createReadStream(filePath);
    file.on('error', () => {
      file.destroy();
    });
    req.on('close', () => {
      file.destroy();
    });
    file.pipe(res);
  }
});

function startServer() {
  server.listen(PORT, () => {
    console.log(`Prompts Virais Clone Server running at http://localhost:${PORT}`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} in use, trying ${PORT + 1}...`);
    PORT++;
    startServer();
  } else {
    console.error('Server error:', err);
  }
});

startServer();
