```
# JavaScript Solution for Google Sheets with HTML/Text Email Support

Here's a complete JavaScript solution that works with Google Sheets and supports both HTML and plain text email content, which can be packaged as an executable:

## 1. Google Sheets Email Sender (Node.js)

```javascript
#!/usr/bin/env node
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

// Create CLI interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function loadCredentials() {
  try {
    const credsPath = path.join(__dirname, 'credentials.json');
    const content = await fs.readFile(credsPath);
    return JSON.parse(content);
  } catch (err) {
    console.error('Error loading credentials file:', err.message);
    process.exit(1);
  }
}

async function getSheetData(auth, spreadsheetId, sheetName, range) {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!${range}`
  });
  return res.data.values;
}

async function sendEmails(config, emails, subject, content, isHtml) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: config.client_email,
      serviceClient: config.client_id,
      privateKey: config.private_key,
      accessToken: config.access_token
    }
  });

  let successCount = 0;
  let failCount = 0;

  for (const [index, email] of emails.entries()) {
    if (!email || !email[0] || !email[0].includes('@')) continue;

    try {
      const mailOptions = {
        from: `"Your Name" <${config.client_email}>`,
        to: email[0],
        subject: subject,
      };

      if (isHtml) {
        mailOptions.html = content;
      } else {
        mailOptions.text = content;
      }

      await transporter.sendMail(mailOptions);
      console.log(`✓ [${index + 1}/${emails.length}] Sent to ${email[0]}`);
      successCount++;
    } catch (error) {
      console.error(`✗ [${index + 1}/${emails.length}] Failed to send to ${email[0]}:`, error.message);
      failCount++;
    }
  }

  console.log(`\nResults: ${successCount} sent successfully, ${failCount} failed`);
}

async function main() {
  console.log('=== Google Sheets Email Sender ===\n');

  // Load configuration
  const credentials = await loadCredentials();
  const spreadsheetId = await ask('Enter Google Sheets ID: ');
  const sheetName = await ask('Enter Sheet name (default: Sheet1): ') || 'Sheet1';
  const emailRange = await ask('Enter email column range (e.g., A2:A): ') || 'A2:A';
  const subject = await ask('Enter email subject: ');
 
  console.log('\nEmail content options:');
  console.log('1. Plain text');
  console.log('2. HTML content');
  console.log('3. Load from HTML file');
  const contentChoice = await ask('Choose option (1-3): ');

  let content, isHtml = false;

  switch (contentChoice) {
    case '1':
      content = await ask('Enter plain text content: ');
      break;
    case '2':
      content = await ask('Enter HTML content: ');
      isHtml = true;
      break;
    case '3':
      const htmlPath = await ask('Enter path to HTML file: ');
      content = await fs.readFile(htmlPath, 'utf8');
      isHtml = true;
      break;
    default:
      console.error('Invalid choice');
      process.exit(1);
  }

  // Authenticate with Google
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/gmail.send'
    ]
  });

  const client = await auth.getClient();
  google.options({ auth: client });

  // Get emails from sheet
  console.log('\nFetching emails from Google Sheets...');
  const emails = await getSheetData(client, spreadsheetId, sheetName, emailRange);
 
  // Confirm before sending
  console.log(`\nReady to send emails to ${emails.length} recipients:`);
  const confirm = await ask('Proceed? (y/n): ');
 
  if (confirm.toLowerCase() !== 'y') {
    console.log('Aborted');
    process.exit(0);
  }

  // Send emails
  console.log('\nSending emails...\n');
  await sendEmails(credentials, emails, subject, content, isHtml);
 
  rl.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
```

## 2. Packaging as Executable

1. First, install the required dependencies:
```bash
npm install googleapis nodemailer xlsx
```

2. Install `pkg` to create executables:
```bash
npm install -g pkg
```

3. Create a `package.json` file:
```json
{
  "name": "google-sheets-email-sender",
  "version": "1.0.0",
  "bin": "./email-sender.js",
  "dependencies": {
    "googleapis": "^120.0.0",
    "nodemailer": "^6.9.1"
  },
  "pkg": {
    "assets": ["credentials.json"]
  }
}
```

4. Create the executable:
```bash
pkg . --targets node18-win-x64,node18-macos-x64,node18-linux-x64 --output email-sender
```

## 3. Setup Instructions

1. **Google Cloud Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable "Google Sheets API" and "Gmail API"
   - Create OAuth 2.0 credentials (Service Account)
   - Download the credentials as `credentials.json`

2. **Share your Google Sheet**:
   - Open your Google Sheet
   - Click "Share" and add your service account email (found in credentials.json)

3. **Run the executable**:
   ```bash
   ./email-sender
   ```

## Features

- Supports both plain text and HTML email content
- Can load HTML content from files
- Progress tracking with success/failure counts
- Interactive CLI interface
- Works with Google Sheets as the data source
- Proper error handling and logging

## Notes

- The first run will require you to authenticate through Google's OAuth flow
- For HTML emails, you can use a full HTML template with CSS styling
- The executable will work on Windows, macOS, and Linux
- For large email lists, consider adding a delay between sends to avoid rate limiting

Would you like me to add any specific features like attachment support or email templates with placeholders?
```