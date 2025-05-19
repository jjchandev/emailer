const fs = require('fs');
const path = require('path');

// Gmail OAuth2 credentials and token
const gmailCreds = require('./gmailapicredentials.json').installed;
const gmailToken = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'gmail_token.json')));

module.exports = {
  OAUTH: {
    clientId: gmailCreds.client_id,
    clientSecret: gmailCreds.client_secret,
    redirectUri: gmailCreds.redirect_uris[0],
    refreshToken: gmailToken.refresh_token,
    user: 'goldwebdesigns5@gmail.com', // replace with your Gmail address
  },
  GOOGLE_CREDENTIALS_FILE: './sheetsapicredentials.json',
  GOOGLE_API_SCOPES: ['https://www.googleapis.com/auth/spreadsheets'],
  SHEET_ID: '1Q4OxZ6hjoUjzPuDkcJi6rlM4FNjWYHe_Kd-vDgupp98',
  SHEET_RANGE: 'AutomatedContacts!A2:F',
  EMAIL_TEMPLATE: {
    subject: (name) => `Hi ${name}, we'd love to connect`,
    body: (name) => `Hello ${name},\n\nHere's your message.\n\nBest,\nTeam`,
  },
};
