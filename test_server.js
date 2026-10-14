const http = require('http');

const PORT = 3030;

const tests = [
  // 1. Core Pages & HTML Content Validation
  {
    url: `http://localhost:${PORT}/`,
    expected: 200,
    name: 'Home Page (Landing Page)',
    validate: (body) => {
      const required = [
        'id="top"',
        'id="demo"',
        'id="capacidades"',
        'id="planos"',
        'id="faq"',
        'Preciso aparecer nos vídeos?',
        'Não. Boa parte dos prompts foi feita justamente para perfil dark',
        'Preciso ter seguidores pra começar?',
        'Não. O TikTok Shop não depende de seguidor, depende de vídeo certo.',
        'Como recebo o acesso?',
        'Acesso imediato.'
      ];
      for (const text of required) {
        if (!body.includes(text)) {
          return `Missing expected content in Home: "${text}"`;
        }
      }
      return true;
    }
  },
  {
    url: `http://localhost:${PORT}/auth`,
    expected: 200,
    name: 'Auth Page (VIP Login)',
    validate: (body) => {
      const required = ['Entrada', 'VIP', 'id="vip-login-form"', 'id="email"', 'id="password"', 'id="open-pix-modal-btn"'];
      for (const text of required) {
        if (!body.includes(text)) return `Missing in Auth: "${text}"`;
      }
      return true;
    }
  },
  {
    url: `http://localhost:${PORT}/criar-acesso`,
    expected: 200,
    name: 'Criar Acesso Page',
    validate: (body) => {
      const required = ['Crie sua senha', 'id="ca-step1"', 'id="ca-email"', 'id="ca-verify-btn"'];
      for (const text of required) {
        if (!body.includes(text)) return `Missing in Criar Acesso: "${text}"`;
      }
      return true;
    }
  },
  {
    url: `http://localhost:${PORT}/ativar`,
    expected: 200,
    name: 'Ativar Page',
    validate: (body) => {
      const required = ['Ative sua conta', 'id="ativar-step1"', 'id="ativar-email"', 'id="ativar-verify-btn"'];
      for (const text of required) {
        if (!body.includes(text)) return `Missing in Ativar: "${text}"`;
      }
      return true;
    }
  },
  {
    url: `http://localhost:${PORT}/membros`,
    expected: 200,
    name: 'Membros VIP Area',
    validate: (body) => {
      const required = ['capa-vip.png', 'id="banner-carousel"', 'prompt-video-card', 'id="mentoria-banner"', 'Copiar Prompt'];
      for (const text of required) {
        if (!body.includes(text)) return `Missing in Membros: "${text}"`;
      }
      return true;
    }
  },
  {
    url: `http://localhost:${PORT}/extrair-prompt`,
    expected: 200,
    name: 'Extrair Prompt Tool',
    validate: (body) => {
      const required = ['Extrair prompt de', 'id="video-file-input"', 'id="drop-zone"', 'id="extract-submit-btn"'];
      for (const text of required) {
        if (!body.includes(text)) return `Missing in Extrair Prompt: "${text}"`;
      }
      return true;
    }
  },

  // 2. Bundles & Stylesheets
  { url: `http://localhost:${PORT}/assets/styles-CMsMeHHC.css`, expected: 200, name: 'Main Stylesheet' },
  { url: `http://localhost:${PORT}/assets/index-BpEXh5S0.js`, expected: 200, name: 'Main JS Bundle' },
  { url: `http://localhost:${PORT}/enhancements.css`, expected: 200, name: 'Enhancements CSS' },
  { url: `http://localhost:${PORT}/enhancements.js`, expected: 200, name: 'Enhancements JS' },

  // 3. Previously Extracted Media
  { url: `http://localhost:${PORT}/__l5e/assets-v1/5f4ebab9-52d0-4b3e-bd90-2fc6b6f949ba/rv-logo-3d.png`, expected: 200, name: 'RV Logo 3D' },
  { url: `http://localhost:${PORT}/__l5e/assets-v1/892e8758-6643-471a-a955-20aba5b48d7d/prompts-virais-vsl-poster.jpg`, expected: 200, name: 'VSL Poster' },

  // 4. Newly Discovered & Downloaded Visual Assets (Were Missing in Prior Attempt!)
  { url: `http://localhost:${PORT}/__l5e/assets-v1/db6e7d88-4769-424b-868b-d38df9b3197f/rv-logo-glass.png`, expected: 200, name: 'Glass 3D Logo (Auth)' },
  { url: `http://localhost:${PORT}/__l5e/assets-v1/f2d74083-eb53-4418-a00c-b1473d5ba21a/capa-vip.png`, expected: 200, name: 'VIP Cover Banner' },
  { url: `http://localhost:${PORT}/__l5e/assets-v1/9659af86-a3ab-47f0-8b1e-b51458e47b6b/capa-estilos-prompts.png`, expected: 200, name: 'Styles Cover Banner' },
  { url: `http://localhost:${PORT}/__l5e/assets-v1/228e5a13-c442-4eb9-9efc-8967f0916d21/capa-prompts-vendem.png`, expected: 200, name: 'Selling Cover Banner' },
  { url: `http://localhost:${PORT}/__l5e/assets-v1/2c6e0ef2-a05c-437f-9943-91044d256bc0/capa-prompts-virais-duo.png`, expected: 200, name: 'Duo Cover Banner' },
  { url: `http://localhost:${PORT}/__l5e/assets-v1/e969fe4c-d549-4d55-a077-97a317d72f2b/kael-santyns.jpg`, expected: 200, name: 'Author Photo (Kael Santyns)' },
  { url: `http://localhost:${PORT}/91f41bb0-7d74-4396-9234-8ef7cc5000b0/id-preview-e8b51571--4cc687db-5ec2-472f-8bd2-9235598d8194.lovable.app-1780190619524.png`, expected: 200, name: 'Social Preview Image' },

  // 5. Video Streaming & Partial Range Request (HTTP 206)
  {
    url: `http://localhost:${PORT}/__l5e/assets-v1/3bd9fe40-1977-4109-940b-17dc775f6f7a/prompts-virais-vsl-compatible.mp4`,
    headers: { Range: 'bytes=0-1024' },
    expected: 206,
    name: 'VSL Video HTTP 206 Range Streaming'
  },

  // 6. Regression Test: Strict 404 for Non-Existent Static Asset (Fixed Bug!)
  {
    url: `http://localhost:${PORT}/assets/non-existent-regression-test-999.png`,
    expected: 404,
    name: 'Strict 404 on Missing Static Asset (Regression Guard)'
  },

  // 7. API Endpoint: Mock Pix Creation & Coupon Calculation
  {
    url: `http://localhost:${PORT}/api/create-pix`,
    method: 'POST',
    postData: JSON.stringify({ plan: 'vip', coupon: 'FABRICADEUGC' }),
    expected: 200,
    name: 'POST /api/create-pix with Discount Coupon',
    validate: (body) => {
      try {
        const json = JSON.parse(body);
        if (json.ok && json.amountCents === 14700 && json.couponApplied && json.copyPaste) {
          return true;
        }
        return `Unexpected API response: ${body}`;
      } catch (err) {
        return `JSON parse error: ${err.message}`;
      }
    }
  },
  // 8. Admin Dashboard Page
  {
    url: `http://localhost:${PORT}/admin`,
    expected: 200,
    name: 'Admin Dashboard Page',
    validate: (body) => {
      if (body.includes('Painel Master Admin') && body.includes('Gestão de Alunos')) {
        return true;
      }
      return 'Admin page missing essential elements';
    }
  },

  // 9. Admin Users API (GET /api/admin/users)
  {
    url: `http://localhost:${PORT}/api/admin/users`,
    expected: 200,
    name: 'GET /api/admin/users returns student list',
    validate: (body) => {
      try {
        const json = JSON.parse(body);
        if (json.ok && Array.isArray(json.users) && json.users.length > 0) return true;
        return `Unexpected response: ${body}`;
      } catch (err) {
        return `JSON parse error: ${err.message}`;
      }
    }
  },

  // 10. Auth Login Security: Unknown user is REJECTED
  {
    url: `http://localhost:${PORT}/api/auth/login`,
    method: 'POST',
    postData: JSON.stringify({ email: 'hacker_ou_estranho@gmail.com', password: '123' }),
    expected: 401,
    name: 'POST /api/auth/login Rejects Unauthorized User (Admin Control)',
    validate: (body) => {
      try {
        const json = JSON.parse(body);
        if (!json.ok && json.error.includes('administrador')) return true;
        return `Unexpected response: ${body}`;
      } catch (err) {
        return `JSON parse error: ${err.message}`;
      }
    }
  },

  // 11. Auth Login Security: Registered user is ACCEPTED
  {
    url: `http://localhost:${PORT}/api/auth/login`,
    method: 'POST',
    postData: JSON.stringify({ email: 'aluno@vip.com', password: '123' }),
    expected: 200,
    name: 'POST /api/auth/login Accepts Authorized Student',
    validate: (body) => {
      try {
        const json = JSON.parse(body);
        if (json.ok && json.user && json.user.email === 'aluno@vip.com') return true;
        return `Unexpected response: ${body}`;
      } catch (err) {
        return `JSON parse error: ${err.message}`;
      }
    }
  },

  // 12. Checkout Page Route (/checkout)
  {
    url: `http://localhost:${PORT}/checkout`,
    expected: 200,
    name: 'Checkout Page (/checkout)',
    validate: (body) => {
      const required = [
        'Checkout Seguro',
        'id="cust-name"',
        'id="cust-email"',
        'id="cust-cpf"',
        'id="submit-checkout-btn"',
        'id="pix-payment-view"',
        'SyncPay',
        'FABRICADEUGC'
      ];
      for (const str of required) {
        if (!body.includes(str)) return `Missing in /checkout: "${str}"`;
      }
      return true;
    }
  },

  // 13. Checkout Page File Route (/checkout.html)
  {
    url: `http://localhost:${PORT}/checkout.html`,
    expected: 200,
    name: 'Checkout HTML File Route (/checkout.html)'
  },

  // 14. SyncPay Generate Pix API (/api/checkout/pix)
  {
    url: `http://localhost:${PORT}/api/checkout/pix`,
    method: 'POST',
    postData: JSON.stringify({
      name: 'João Teste',
      email: 'joao.teste@email.com',
      phone: '11999999999',
      cpf: '123.456.789-00',
      plan: 'vip',
      coupon: 'FABRICADEUGC'
    }),
    expected: 200,
    name: 'POST /api/checkout/pix Generates Pix Code and Identifier',
    validate: (body) => {
      try {
        const json = JSON.parse(body);
        if (!json.ok) return `Pix generation returned ok: false - ${body}`;
        if (!json.identifier) return `Missing transaction identifier in response`;
        if (!json.pix_code || !json.pix_code.startsWith('000201')) return `Invalid Pix EMV code format: ${json.pix_code}`;
        if (json.amountFormatted !== 'R$ 147,00') return `Unexpected amount: ${json.amountFormatted}`;
        return true;
      } catch (err) {
        return `JSON parse error: ${err.message}`;
      }
    }
  },

  // 15. SyncPay Payment Status API (/api/checkout/status)
  {
    url: `http://localhost:${PORT}/api/checkout/status?id=test_tx_123&email=novo.aluno@email.com&force=1`,
    expected: 200,
    name: 'GET /api/checkout/status Returns Paid & Provisions Student Access',
    validate: (body) => {
      try {
        const json = JSON.parse(body);
        if (!json.ok || !json.paid) return `Payment status not confirmed: ${body}`;
        if (!json.user || !json.user.email || !json.user.password) return `Missing user credentials in status response: ${body}`;
        return true;
      } catch (err) {
        return `JSON parse error: ${err.message}`;
      }
    }
  },

  // 16. Admin Gateway Config API (GET /api/admin/gateway)
  {
    url: `http://localhost:${PORT}/api/admin/gateway`,
    expected: 200,
    name: 'GET /api/admin/gateway Returns Configuration',
    validate: (body) => {
      try {
        const json = JSON.parse(body);
        if (!json.ok || !json.config || json.config.provider !== 'syncpay') return `Invalid gateway config: ${body}`;
        return true;
      } catch (err) {
        return `JSON parse error: ${err.message}`;
      }
    }
  },

  // 17. Admin Gateway Config API (POST /api/admin/gateway)
  {
    url: `http://localhost:${PORT}/api/admin/gateway`,
    method: 'POST',
    postData: JSON.stringify({
      client_id: '3c672d63-bf75-46d1-a95b-8fcbb56251e7',
      client_secret: 'e50654c1-3aba-49f0-a52c-ef966b4d0f0f',
      base_url: 'https://api.syncpayments.com.br',
      test_mode: false
    }),
    expected: 200,
    name: 'POST /api/admin/gateway Updates Configuration',
    validate: (body) => {
      try {
        const json = JSON.parse(body);
        if (!json.ok || !json.config) return `Failed to save gateway config: ${body}`;
        if (json.config.client_id !== '3c672d63-bf75-46d1-a95b-8fcbb56251e7') return `client_id was not updated correctly`;
        return true;
      } catch (err) {
        return `JSON parse error: ${err.message}`;
      }
    }
  },

  // 18. SyncPay Webhook Endpoint (POST /api/webhook/syncpay)
  {
    url: `http://localhost:${PORT}/api/webhook/syncpay`,
    method: 'POST',
    postData: JSON.stringify({
      identifier: 'test_tx_webhook_999',
      status: 'PAID',
      client: {
        name: 'Cliente Webhook',
        email: 'webhook.aluno@email.com'
      }
    }),
    expected: 200,
    name: 'POST /api/webhook/syncpay Processes Webhook and Returns 200',
    validate: (body) => {
      try {
        const json = JSON.parse(body);
        if (json.ok && json.received) return true;
        return `Unexpected webhook response: ${body}`;
      } catch (err) {
        return `JSON parse error: ${err.message}`;
      }
    }
  }
];

function runTest(t) {
  return new Promise((resolve) => {
    const parsed = new URL(t.url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: t.method || 'GET',
      headers: t.headers || {}
    };

    if (t.postData) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(t.postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const statusMatch = res.statusCode === t.expected;
        let validationError = null;

        if (statusMatch && t.validate) {
          const vResult = t.validate(data);
          if (vResult !== true) {
            validationError = vResult;
          }
        }

        const passed = statusMatch && !validationError;
        const msg = validationError ? `Validation Failed: ${validationError}` : `Status ${res.statusCode} (expected ${t.expected})`;
        console.log(`[${passed ? 'PASS' : 'FAIL'}] ${t.name}: ${msg}`);
        resolve(passed);
      });
    });

    req.on('error', (e) => {
      console.log(`[FAIL] ${t.name}: Connection error: ${e.message}`);
      resolve(false);
    });

    if (t.postData) {
      req.write(t.postData);
    }
    req.end();
  });
}

function isServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}/`, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

const { fork } = require('child_process');

async function main() {
  console.log(`\n========================================================`);
  console.log(`Deep Automated Verification Suite (Port ${PORT})`);
  console.log(`========================================================\n`);

  let serverProcess = null;
  const running = await isServerRunning();
  if (!running) {
    serverProcess = fork('serve.js', [], { stdio: 'ignore' });
    let attempts = 0;
    while (!(await isServerRunning()) && attempts < 10) {
      await new Promise(r => setTimeout(r, 300));
      attempts++;
    }
  }

  let allPassed = true;
  for (const t of tests) {
    const p = await runTest(t);
    if (!p) allPassed = false;
  }

  if (serverProcess) {
    try { serverProcess.kill(); } catch (_) {}
  }

  console.log(`\n========================================================`);
  console.log(`Overall Result: ${allPassed ? 'ALL TESTS PASSED (100% SUCCESS)!' : 'SOME TESTS FAILED!'}`);
  console.log(`========================================================\n`);
  process.exit(allPassed ? 0 : 1);
}

main();
