const syncpay = require('../syncpay');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function getUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch (e) {}
  return [
    {
      id: "usr_default_admin",
      name: "Administrador Master",
      email: "admin@prompts.com",
      password: "123",
      role: "admin",
      plan: "VIP Vitalício",
      status: "ativo"
    },
    {
      id: "usr_aluno_demo",
      name: "Aluno VIP",
      email: "aluno@vip.com",
      password: "123",
      role: "aluno",
      plan: "VIP Vitalício",
      status: "ativo"
    }
  ];
}

function saveUsers(users) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    // Read-only filesystem on serverless
  }
}

module.exports = async function handler(req, res) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  let parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Parse Body (if not already parsed by serverless environment)
  let data = req.body;
  if (!data || typeof data !== 'object') {
    let bodyStr = '';
    await new Promise((resolve) => {
      req.on('data', chunk => bodyStr += chunk);
      req.on('end', () => {
        try { data = JSON.parse(bodyStr); } catch (_) { data = {}; }
        resolve();
      });
    });
  }

  // 1. Auth Login API (/api/auth/login)
  if (pathname.includes('/auth/login') && req.method === 'POST') {
    const email = (data.email || '').trim().toLowerCase();
    const password = (data.password || '').trim();

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email);

    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: 'Acesso negado: Este e-mail não foi liberado pelo administrador.' }));
      return;
    }

    if (user.status === 'bloqueado') {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: 'Seu acesso foi temporariamente suspenso pelo administrador.' }));
      return;
    }

    if (user.password !== password) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: 'Senha incorreta para este usuário.' }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan }
    }));
    return;
  }

  // 2. Admin Users Management API (/api/admin/users)
  if (pathname.includes('/admin/users')) {
    if (req.method === 'GET') {
      const users = getUsers();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, users }));
      return;
    }

    if (req.method === 'POST') {
      let users = getUsers();
      if (data.action === 'create') {
        const email = (data.user?.email || '').trim().toLowerCase();
        const password = (data.user?.password || '').trim();
        if (!email || !password) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: 'E-mail e senha são obrigatórios.' }));
          return;
        }
        if (users.some(u => u.email.toLowerCase() === email)) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
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
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: true, user: newUser }));
        return;
      }

      if (data.action === 'toggle_status') {
        const u = users.find(x => x.id === data.id);
        if (u) {
          u.status = u.status === 'ativo' ? 'bloqueado' : 'ativo';
          saveUsers(users);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: true, user: u }));
          return;
        }
      }

      if (data.action === 'delete') {
        users = users.filter(x => x.id !== data.id);
        saveUsers(users);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: true }));
        return;
      }

      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: 'Ação inválida.' }));
      return;
    }
  }

  // 3. SyncPay Checkout API: Generate Pix (/api/checkout/pix)
  if (pathname.includes('/checkout/pix') && req.method === 'POST') {
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

    const host = req.headers.host || 'localhost';
    const proto = req.headers['x-forwarded-proto'] || 'https';
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

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error('Error in /api/checkout/pix:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: 'Erro ao gerar Pix: ' + err.message }));
    }
    return;
  }

  // 4. SyncPay Checkout API: Check Status (/api/checkout/status)
  if (pathname.includes('/checkout/status') && req.method === 'GET') {
    const id = parsedUrl.searchParams.get('id') || '';
    const email = (parsedUrl.searchParams.get('email') || '').trim().toLowerCase();
    const force = parsedUrl.searchParams.get('force') === '1';

    try {
      const check = await syncpay.checkTransactionStatus(id, force);

      if (check.paid) {
        let users = getUsers();
        let user = users.find(u => u.email.toLowerCase() === email);

        if (!user) {
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

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
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

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, paid: false, status: check.status }));
    } catch (err) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, paid: false, error: err.message }));
    }
    return;
  }

  // 5. Admin Gateway Config API (/api/admin/gateway)
  if (pathname.includes('/admin/gateway')) {
    if (req.method === 'GET') {
      const config = syncpay.getGatewayConfig();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, config }));
      return;
    }

    if (req.method === 'POST') {
      if (data.action === 'test_connection') {
        const testRes = await syncpay.testSyncPayConnection(
          data.client_id,
          data.client_secret,
          data.base_url || 'https://api.syncpayments.com.br'
        );
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
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
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: saved, config: updatedConfig }));
      return;
    }
  }

  // 6. Legacy Create Pix API (/api/create-pix)
  if (pathname.includes('/create-pix') && req.method === 'POST') {
    const plan = (data.plan || 'vip').toLowerCase();
    const isCoupon = (data.coupon || '').trim().toUpperCase() === 'FABRICADEUGC';
    const amountCents = plan === 'basic' ? 6790 : (isCoupon ? 14700 : 19790);
    const amount = (amountCents / 100).toFixed(2);
    const txId = `pv_${Date.now()}`;
    const pixCode = syncpay.generateEmvPixCode(amount, txId);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({
      ok: true,
      amountCents,
      couponApplied: isCoupon,
      copyPaste: pixCode,
      identifier: txId
    }));
    return;
  }

  // 7. Webhook Handler (/api/webhook/syncpay)
  if (pathname.includes('/webhook/syncpay') && req.method === 'POST') {
    const hookResult = syncpay.handleSyncPayWebhook(data);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: true, received: true, hookResult }));
    return;
  }

  // Fallback 404 for unknown API
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ ok: false, error: 'Endpoint não encontrado.' }));
};
