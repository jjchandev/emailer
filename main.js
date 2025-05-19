require('dotenv').config();
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');

// === CONFIG ===
const SHEET_ID = 'your_google_sheet_id';
const RANGE = 'Sheet1!A2:C'; // Adjust as needed

// === AUTH ===
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// === EMAIL SETUP ===
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // App Password if using 2FA
  },
});

// === MAIN FUNCTION ===
async function run() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
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
      from: process.env.GMAIL_USER,
      to: email,
      subject: `Special Offer for ${companyName}`,
      text: `Hi ${companyName},\n\nWe wanted to reach out with a special opportunity for your business.\n\nPlease reply if you're interested.\n\nBest,\nYour Company`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${companyName} at ${email}`);

      // Update status in the sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
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
