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
  // Get Google Sheets client and fetch rows
  const client = await sheetsAuth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.SHEET_ID,
    range: config.SHEET_RANGE,
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  // Get fresh access token for Gmail API
  const tokenResponse = await oAuth2Client.getAccessToken();
  const accessToken = tokenResponse.token;
  if (!accessToken) throw new Error('Failed to get access token');

  for (let i = 0; i < rows.length; i++) {
    const [link, companyName, website, phone, email, status] = rows[i];

    if (status?.toLowerCase().trim() === 'sent') continue; // skip sent
    if (!email) continue; // skip no email

    const recipientEmail = TESTING_MODE ? 'jiajiechandev@gmail.com' : email;

    // Compose RFC 2822 email
    const emailText = config.EMAIL_TEMPLATE.body(companyName);
    const subjectText = config.EMAIL_TEMPLATE.subject(companyName);

    const emailLines = [
      `From: ${config.OAUTH.user}`,
      `To: ${recipientEmail}`,
      `Subject: ${subjectText}`,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      emailText,
    ];

    const rawEmail = base64urlEncode(emailLines.join('\r\n'));

    // Log details
    console.log(`🔍 EMAIL DETAILS`);
    console.log(`Row: ${i + 2}`);
    console.log(`From: ${config.OAUTH.user}`);
    console.log(`To: ${recipientEmail}`);
    console.log(`Subject: ${subjectText}`);
    console.log(`Body:\n${emailText}`);
    console.log('---');

    try {
      await sendEmail(accessToken, rawEmail);
      console.log(`✅ Email sent to ${companyName} <${recipientEmail}>`);
    } catch (err) {
      console.error(`❌ Failed to send to ${recipientEmail}: ${err.message}`);
      continue; // skip updating status if failed
    }

    if (!TESTING_MODE) {
      // Update status to 'sent' in sheet
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
