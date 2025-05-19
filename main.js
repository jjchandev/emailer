const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const config = require('./config');

// === AUTH ===
const auth = new google.auth.GoogleAuth({
  keyFile: config.GOOGLE_CREDENTIALS_FILE,
  scopes: config.GOOGLE_API_SCOPES,
});

// === EMAIL SETUP ===
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.GMAIL.user,
    pass: config.GMAIL.pass,
  },
});

// === MAIN FUNCTION ===
async function run() {
  const client = await auth.getClient();
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

  for (let i = 0; i < rows.length; i++) {
    const [companyName, email, status] = rows[i];

    if (status?.toLowerCase() !== 'no action') continue;

    const mailOptions = {
      from: config.GMAIL.user,
      to: email,
      subject: config.EMAIL_TEMPLATE.subject(companyName),
      text: config.EMAIL_TEMPLATE.body(companyName),
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${companyName} at ${email}`);

      // Update status in the sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: config.SHEET_ID,
        range: `Sheet1!C${i + 2}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['sent']],
        },
      });
    } catch (err) {
      console.error(`Failed to send to ${email}:`, err.message);
    }
  }
}

run();
