const { google } = require('googleapis');
const nodemailer = require('nodemailer');
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
oAuth2Client.scopes = config.OAUTH.scopes;

async function run() {
  const client = await sheetsAuth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Fetch data from sheet
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.SHEET_ID,
    range: config.SHEET_RANGE,
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }

  // Setup Gmail transporter with access token
  const accessToken = await oAuth2Client.getAccessToken();
  console.log('Credentials Check:', {
  user: config.OAUTH.user,
  clientId: config.OAUTH.clientId?.slice(0, 12) + '...', // Partial to avoid exposing full ID
  clientSecret: config.OAUTH.clientSecret?.slice(0, 5) + '...',
  refreshToken: config.OAUTH.refreshToken?.slice(0, 8) + '...',
});
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: config.OAUTH.user,
      clientId: config.OAUTH.clientId,
      clientSecret: config.OAUTH.clientSecret,
      refreshToken: config.OAUTH.refreshToken,
      accessToken: accessToken.token
    },
  });

  // Iterate through each row and process
  for (let i = 0; i < rows.length; i++) {
  const [link, companyName, website, phone, email, status] = rows[i];

  if (status?.toLowerCase().trim() === 'sent') continue; // skip if already sent
  if (!email) continue; // skip if email undefined

  // Override recipient in test mode
  const recipientEmail = TESTING_MODE ? 'jiajiechandev@gmail.com' : email;

  const mailOptions = {
    from: config.OAUTH.user,
    to: recipientEmail,
    subject: config.EMAIL_TEMPLATE.subject(companyName),
    text: config.EMAIL_TEMPLATE.body(companyName),
  };

  // Log email info always
  console.log(`🔍 EMAIL DETAILS`);
  console.log(`Row: ${i + 2}`);
  console.log(`From: ${mailOptions.from}`);
  console.log(`To: ${mailOptions.to}`);
  console.log(`Subject: ${mailOptions.subject}`);
  console.log(`Body:\n${mailOptions.text}`);
  console.log('---');

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${companyName} <${recipientEmail}>`);
  } catch (err) {
    console.error(`❌ Failed to send to ${recipientEmail}: ${err.message}`);
    continue; // skip updating status if email failed
  }

  if (!TESTING_MODE) {
    const statusCell = `AutomatedContacts!F${i + 2}`; // Column F = Status
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.SHEET_ID,
      range: statusCell,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['sent']],
      },
    });
  }
}
}

run().catch(console.error);
