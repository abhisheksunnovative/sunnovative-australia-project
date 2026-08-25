const http = require('http');
http.get('http://localhost:4005/api/bde/6a734103ad26aeb78ceb3b4d/leads', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log("Success flag:", json.success);
    console.log("Message:", json.message);
  });
});
