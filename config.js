require('dotenv').config();
const path = require('path');
const gmailCreds = require(path.resolve('./gmailapicredentials.json'));

module.exports = {
  // Google Sheets
  SHEET_ID: '1Q4OxZ6hjoUjzPuDkcJi6rlM4FNjWYHe_Kd-vDgupp98',
  SHEET_RANGE: 'Sheet1!A2:C',
  GOOGLE_API_SCOPES: ['https://www.googleapis.com/auth/spreadsheets'],

  // Sheets API - Service Account JSON file
  GOOGLE_CREDENTIALS_FILE: './sheetsapicredentials.json',

  // Gmail OAuth2 Credentials from local file
  OAUTH: {
    user: process.env.GMAIL_USER,
    clientId: gmailCreds.client_id,
    clientSecret: gmailCreds.client_secret,
    redirectUri: gmailCreds.redirect_uris[0],
    refreshToken: gmailCreds.refresh_token,
  },

  // Email Template
  EMAIL_TEMPLATE: {
    subject: (company) => `Special Offer for ${company}`,
    body: (company) => `Hi ${company},\n\nWe wanted to reach out with a special opportunity for your business.\n\nPlease reply if you're interested.\n\nBest,\nYour Company`,
  },
};
