const fetch = require('node-fetch');

async function test() {
  try {
    const r = await fetch("http://localhost:4005/api/order-journey-settings?country=india");
    const d = await r.json();
    console.log(JSON.stringify(d, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
