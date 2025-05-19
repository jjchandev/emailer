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
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: config.OAUTH.user,
      clientId: config.OAUTH.clientId,
      clientSecret: config.OAUTH.clientSecret,
      refreshToken: config.OAUTH.refreshToken,
      accessToken: accessToken.token,
    },
  });

  // Send emails and update status
  for (let i = 0; i < rows.length; i++) {
    const [companyName, email, status] = rows[i];
    if (status?.toLowerCase() !== 'no action') continue;

    const mailOptions = {
      from: config.OAUTH.user,
      to: email,
      subject: config.EMAIL_TEMPLATE.subject(companyName),
      text: config.EMAIL_TEMPLATE.body(companyName),
    };

    if (TESTING_MODE) {
      console.log(`🔍 TEST EMAIL`);
      console.log(`From: ${mailOptions.from}`);
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body:\n${mailOptions.text}`);
      console.log('---');
      continue; // Skip sending and sheet update
    }

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${companyName} <${email}>`);

      await sheets.spreadsheets.values.update({
        spreadsheetId: config.SHEET_ID,
        range: `Sheet1!C${i + 2}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['sent']],
        },
      });
    } catch (err) {
      console.error(`❌ Failed to send to ${email}: ${err.message}`);
    }
  }
}

run().catch(console.error);
