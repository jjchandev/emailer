const { google } = require('googleapis');
const https = require('https');
const config = require('./config');

// === Testing Flag ===
const TESTING_MODE = true; // Set to false to actually send emails

// === Auth for Google Sheets ===
const sheetsAuth = new google.auth.GoogleAuth({
  keyFile: config.GOOGLE_CREDENTIALS_FILE,
  scopes: config.GOOGLE_API_SCOPES,
});

// === Auth for Gmail OAuth2 ===
const oAuth2Client = new google.auth.OAuth2(
  config.OAUTH.clientId,
  config.OAUTH.clientSecret,
  config.OAUTH.redirectUri
);
oAuth2Client.setCredentials({ refresh_token: config.OAUTH.refreshToken });

// Helper: base64url encode for Gmail API raw email
function base64urlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Helper: build multipart MIME message
function makeRawMessage({ from, to, subject, textBody, htmlBody }) {
  const boundary = "__MY_BOUNDARY__";
  let mime = "";

  // Headers
  mime += `From: ${from}\r\n`;
  mime += `To: ${to}\r\n`;
  mime += `Subject: ${subject}\r\n`;
  mime += `MIME-Version: 1.0\r\n`;
  mime += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;

  // Plain‑text part
  mime += `--${boundary}\r\n`;
  mime += `Content-Type: text/plain; charset="UTF-8"\r\n\r\n`;
  mime += `${textBody}\r\n\r\n`;

  // HTML part
  mime += `--${boundary}\r\n`;
  mime += `Content-Type: text/html; charset="UTF-8"\r\n\r\n`;
  mime += `${htmlBody}\r\n\r\n`;

  // End
  mime += `--${boundary}--`;

  return base64urlEncode(mime);
}

// Helper: send email via Gmail API (raw)
async function sendEmail(accessToken, rawEmail) {
  const options = {
    hostname: 'gmail.googleapis.com',
    path: '/gmail/v1/users/me/messages/send',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Status: ${res.statusCode} - ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify({ raw: rawEmail }));
    req.end();
  });
}

async function run() {
  // Fetch rows from Sheets
  const sheetsClient = await sheetsAuth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: sheetsClient });
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: config.SHEET_ID,
    range: config.SHEET_RANGE,
  });

  const rows = data.values || [];
  if (!rows.length) {
    console.log('No data found.');
    return;
  }

  // Get new Gmail access token
  const tokenResponse = await oAuth2Client.getAccessToken();
  const accessToken = tokenResponse.token;
  if (!accessToken) throw new Error('Failed to get access token');

  for (let i = 0; i < rows.length; i++) {
    const [link, companyName, website, phone, email, status, niche, opener] = rows[i];
    console.log(opener)
    if (status?.toLowerCase().trim() === 'sent' || !email) continue;

    const to = TESTING_MODE ? 'jiajiechandev@gmail.com' : email;
    const subject = config.EMAIL_TEMPLATE.subject(companyName);
    const textBody = config.EMAIL_TEMPLATE.text(companyName, opener);
    const htmlBody = config.EMAIL_TEMPLATE.html(companyName, opener);

    // Build raw MIME payload
    const rawEmail = makeRawMessage({
      from: config.OAUTH.user,
      to,
      subject,
      textBody,
      htmlBody,
    });

    // Log for debugging
    console.log(`🔍 EMAIL DETAILS
Row: ${i + 2}
From: ${config.OAUTH.user}
To: ${to}
Subject: ${subject}
---`);

    try {
      await sendEmail(accessToken, rawEmail);
      console.log(`✅ Email sent to ${companyName} <${to}>`);
    } catch (err) {
      console.error(`❌ Failed to send to ${to}: ${err.message}`);
      continue;
    }

    // Mark as sent in Sheets if not testing
    if (!TESTING_MODE) {
      const statusCell = `AutomatedContacts!F${i + 2}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: config.SHEET_ID,
        range: statusCell,
        valueInputOption: 'RAW',
        requestBody: { values: [['sent']] },
      });
    }
  }
}

run().catch(console.error);
