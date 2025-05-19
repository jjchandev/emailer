const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Replace with the actual code from your redirect URL
const CODE = '4/0AUJR-x7cC5NVmYC4KlMZCgVm_o26eTEPVfe-TRFwioqTyDCQxJyatVpZ_-osdncqG5gGHg';

// Load credentials
const gmailCreds = require('./gmailapicredentials.json').installed;

const oAuth2Client = new google.auth.OAuth2(
  gmailCreds.client_id,
  gmailCreds.client_secret,
  gmailCreds.redirect_uris[0]
);

oAuth2Client.getToken(CODE, (err, token) => {
  if (err) {
    return console.error('Error retrieving access token:', err);
  }

  console.log('✅ Tokens acquired!');
  console.log(token);

  // Save to a file if you want
  fs.writeFileSync('./gmail_token.json', JSON.stringify(token, null, 2));
  console.log('💾 Saved token to gmail_token.json');
});
