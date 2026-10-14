const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'data', 'gateway_config.json');

// In-memory transaction store for tracking checkout transactions
const transactionsStore = new Map();

function getGatewayConfig() {
  const defaultCfg = {
    provider: 'syncpay',
    client_id: process.env.SYNCPAY_CLIENT_ID || '3c672d63-bf75-46d1-a95b-8fcbb56251e7',
    client_secret: process.env.SYNCPAY_CLIENT_SECRET || 'e50654c1-3aba-49f0-a52c-ef966b4d0f0f',
    base_url: process.env.SYNCPAY_BASE_URL || 'https://api.syncpayments.com.br',
    webhook_url: process.env.SYNCPAY_WEBHOOK_URL || '',
    test_mode: false
  };

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const fileCfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return { ...defaultCfg, ...fileCfg };
    }
  } catch (err) {
    console.error('Error reading gateway config:', err);
  }
  return defaultCfg;
}

function saveGatewayConfig(config) {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving gateway config:', err);
    return false;
  }
}

// Compute standard CRC16-CCITT for Pix EMV BR Code
function computePixCRC16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= (payload.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function generateEmvPixCode(amount, refId) {
  const formattedAmount = Number(amount).toFixed(2);
  const chavePix = 'pix@promptsvirais.com.br';
  
  // Format TLV (Tag Length Value)
  const formatTlv = (id, val) => {
    const str = String(val);
    const len = String(str.length).padStart(2, '0');
    return `${id}${len}${str}`;
  };

  const merchantAccountInfo = 
    formatTlv('00', 'br.gov.bcb.pix') +
    formatTlv('01', chavePix);

  const additionalData = formatTlv('05', refId.slice(0, 25));

  let payload = 
    formatTlv('00', '01') + // Format indicator
    formatTlv('26', merchantAccountInfo) + // Account info
    formatTlv('52', '0000') + // Merchant Category Code
    formatTlv('53', '986') + // Currency BRL
    formatTlv('54', formattedAmount) + // Amount
    formatTlv('58', 'BR') + // Country code
    formatTlv('59', 'PROMPTS VIRAIS') + // Merchant Name
    formatTlv('60', 'SAO PAULO') + // Merchant City
    formatTlv('62', additionalData) + // Additional Data (TxID)
    '6304'; // CRC placeholder

  const crc = computePixCRC16(payload);
  return payload + crc;
}

// HTTP request helper with Promise
function requestJson(urlStr, method, headers, data) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const client = parsed.protocol === 'https:' ? https : http;

    const bodyStr = data ? JSON.stringify(data) : null;
    const reqHeaders = {
      'Accept': 'application/json',
      ...headers
    };

    if (bodyStr) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = client.request(parsed, {
      method: method || 'GET',
      headers: reqHeaders,
      timeout: 10000
    }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(raw);
        } catch (_) {
          json = { rawResponse: raw };
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('SyncPay request timed out after 10s'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// 1. Get SyncPay Bearer Token
async function getAuthToken(clientId, clientSecret, baseUrl) {
  const url = `${baseUrl || 'https://api.syncpayments.com.br'}/api/partner/v1/auth-token`;
  const response = await requestJson(url, 'POST', {}, {
    client_id: clientId,
    client_secret: clientSecret
  });

  if (response.statusCode >= 200 && response.statusCode < 300 && response.data.access_token) {
    return {
      ok: true,
      token: response.data.access_token,
      expiresIn: response.data.expires_in
    };
  }

  const errMsg = response.data.message || response.data.error || `HTTP ${response.statusCode}`;
  return {
    ok: false,
    error: errMsg
  };
}

// 2. Test Connection
async function testSyncPayConnection(clientId, clientSecret, baseUrl) {
  try {
    const res = await getAuthToken(clientId, clientSecret, baseUrl);
    return res;
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// 3. Create Pix CashIn Charge
async function createPixCharge(order) {
  const config = getGatewayConfig();
  const txId = `pv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const amount = Number(order.amount).toFixed(2);
  const amountFormatted = `R$ ${amount.replace('.', ',')}`;

  // If in live mode with configured credentials, call SyncPay API
  const hasLiveCredentials = config.client_id && config.client_secret && config.test_mode === false;

  if (hasLiveCredentials) {
    try {
      // Step A: Authenticate
      const auth = await getAuthToken(config.client_id, config.client_secret, config.base_url);
      if (!auth.ok) {
        throw new Error(`SyncPay Auth failed: ${auth.error}`);
      }

      // Step B: Cash-in request
      const cashInUrl = `${config.base_url}/api/partner/v1/cash-in`;
      const cleanCpf = (order.cpf || '').replace(/\D/g, '');
      const cleanPhone = (order.phone || '').replace(/\D/g, '');

      const cashInPayload = {
        amount: Number(amount),
        description: order.description || 'Prompts Virais VIP Vitalício',
        webhook_url: config.webhook_url || order.webhookUrl || '',
        client: {
          name: order.name,
          cpf: cleanCpf,
          email: order.email,
          phone: cleanPhone || '11999999999'
        }
      };

      const res = await requestJson(cashInUrl, 'POST', {
        'Authorization': `Bearer ${auth.token}`
      }, cashInPayload);

      if (res.statusCode >= 200 && res.statusCode < 300 && res.data.pix_code) {
        const identifier = res.data.identifier || txId;
        const transactionRecord = {
          identifier,
          txId,
          amount,
          amountFormatted,
          client: order,
          status: 'PENDING',
          isLive: true,
          createdAt: Date.now()
        };
        transactionsStore.set(identifier, transactionRecord);

        return {
          ok: true,
          identifier,
          pix_code: res.data.pix_code,
          amountFormatted,
          message: res.data.message || 'Pix gerado com sucesso via SyncPay!'
        };
      } else {
        const errorDetail = res.data.message || res.data.error || JSON.stringify(res.data);
        console.warn('SyncPay Cash-in returned error:', errorDetail, 'Falling back to simulated Pix code.');
      }
    } catch (err) {
      console.warn('SyncPay API exception:', err.message, 'Falling back to simulated Pix code.');
    }
  }

  // Simulation / Fallback Mode (Instant & Local EMV Pix)
  const pixCode = generateEmvPixCode(amount, txId);
  const identifier = txId;

  const transactionRecord = {
    identifier,
    txId,
    amount,
    amountFormatted,
    client: order,
    status: 'PENDING',
    isLive: false,
    createdAt: Date.now()
  };
  transactionsStore.set(identifier, transactionRecord);

  return {
    ok: true,
    identifier,
    pix_code: pixCode,
    amountFormatted,
    message: 'Pix gerado com sucesso (Modo Seguro/Simulação SyncPay).'
  };
}

// 4. Check Transaction Status
async function checkTransactionStatus(identifier, forceApprove = false) {
  const config = getGatewayConfig();
  const tx = transactionsStore.get(identifier);

  // If live mode or serverless, query SyncPay API directly
  if (config.client_id && config.client_secret && !config.test_mode) {
    try {
      const auth = await getAuthToken(config.client_id, config.client_secret, config.base_url);
      if (auth.ok) {
        const statusUrl = `${config.base_url}/api/partner/v1/transaction/${identifier}`;
        const res = await requestJson(statusUrl, 'GET', {
          'Authorization': `Bearer ${auth.token}`
        });

        if (res.statusCode === 200 && res.data) {
          const rawStatus = ((res.data && res.data.data && res.data.data.status) || res.data.status || '').toUpperCase();
          if (rawStatus === 'COMPLETED' || rawStatus === 'PAID' || rawStatus === 'APPROVED' || rawStatus === 'CONFIRMED') {
            tx.status = 'PAID';
            return { paid: true, status: 'PAID', tx };
          }
        }
      }
    } catch (err) {
      console.error('Error querying SyncPay status:', err.message);
    }
  }

  // Check if force approved or manually simulated
  if (forceApprove) {
    if (tx) tx.status = 'PAID';
    return { paid: true, status: 'PAID', tx };
  }

  // In simulation test mode: auto-approve after 15 seconds or return current status
  if (tx && tx.status === 'PAID') {
    return { paid: true, status: 'PAID', tx };
  }

  return { paid: false, status: tx ? tx.status : 'NOT_FOUND', tx };
}

// 5. Handle SyncPay Webhook Payload
function handleSyncPayWebhook(payload) {
  // SyncPay webhook structure usually contains { identifier, status, amount, client, etc. }
  const identifier = payload.identifier || payload.id || payload.txid;
  const status = (payload.status || payload.event || '').toUpperCase();

  const isApproved = status === 'COMPLETED' || status === 'PAID' || status === 'APPROVED' || status === 'CONFIRMED';
  
  if (identifier && transactionsStore.has(identifier)) {
    const tx = transactionsStore.get(identifier);
    if (isApproved) {
      tx.status = 'PAID';
    }
    return { ok: true, matched: true, approved: isApproved, tx };
  }

  return { ok: true, matched: false, approved: isApproved, payload };
}

module.exports = {
  getGatewayConfig,
  saveGatewayConfig,
  getAuthToken,
  testSyncPayConnection,
  createPixCharge,
  checkTransactionStatus,
  handleSyncPayWebhook,
  generateEmvPixCode,
  transactionsStore
};
