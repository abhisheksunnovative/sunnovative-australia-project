const http = require('http');

const data = JSON.stringify({ isEligibleForInstallation: true });

const req = http.request({
  hostname: 'localhost',
  port: 4005,
  path: '/api/bde/leads/dummy/eligibility',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let d = '';
  res.on('data', chunk => d += chunk);
  res.on('end', () => console.log('Response:', d));
});

req.write(data);
req.end();
