const http = require('http');

http.get('http://localhost:4005/api/bde/6a734103ad26aeb78ceb3b4d/leads', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log("Total leads returned from API:", json.leads?.length);
    if (json.leads && json.leads.length > 0) {
      console.log("First lead history action:", json.leads[0].history[0]?.action);
    }
  });
}).on('error', err => console.error(err));
