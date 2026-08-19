const fs = require('fs');
const https = require('https');
const dotenv = require('dotenv');
dotenv.config({ path: 'C:\\Users\\Udit Singh\\OneDrive\\Desktop\\Taskly\\apps\\api\\.env' });

const options = {
  hostname: 'openrouter.ai',
  port: 443,
  path: '/api/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(JSON.stringify({
  model: 'google/gemma-4-26b-a4b-it:free',
  messages: [{ role: 'user', content: 'test' }],
  response_format: { type: 'json_object' }
}));
req.end();
