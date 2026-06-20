const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

const mpesaCallbacks = [];

async function getDarajaAccessToken() {
  const consumerKey = process.env.DARAJA_CONSUMER_KEY;
  const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error('Missing Daraja consumer key or secret in environment');
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  return response.data;
}

app.get('/api/mpesa/access-token', async (req, res) => {
  try {
    const data = await getDarajaAccessToken();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mpesa/stkpush', async (req, res) => {
  try {
    const { phone, amount, reference } = req.body;
    const shortcode = process.env.DARAJA_SHORTCODE;
    const passkey = process.env.DARAJA_PASSKEY;
    const callbackUrl = process.env.DARAJA_CALLBACK_URL;

    if (!phone || !amount || !reference) {
      return res.status(400).json({ error: 'phone, amount, and reference are required' });
    }
    if (!shortcode || !passkey || !callbackUrl) {
      return res.status(500).json({ error: 'Missing Daraja configuration in environment' });
    }

    const tokenData = await getDarajaAccessToken();
    const accessToken = tokenData.access_token;

    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const body = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Number(amount),
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: reference,
      TransactionDesc: `Payment ${reference}`,
    };

    const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    res.json(response.data);
  } catch (error) {
    const message = error.response?.data || error.message;
    res.status(500).json({ error: message });
  }
});

app.post('/api/mpesa/callback', (req, res) => {
  const callbackData = req.body;
  mpesaCallbacks.push({ receivedAt: new Date().toISOString(), callbackData });
  console.log('Received Daraja callback:', JSON.stringify(callbackData, null, 2));
  res.json({ status: 'ok' });
});

app.get('/api/mpesa/callbacks', (req, res) => {
  res.json(mpesaCallbacks);
});

app.listen(PORT, () => {
  console.log(`M-Pesa backend running on http://localhost:${PORT}`);
  console.log(`CORS allows frontend at ${FRONTEND_URL}`);
});
