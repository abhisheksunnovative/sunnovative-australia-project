import fetch from 'node-fetch';

async function test() {
  const url = 'http://localhost:4005/api/customer/epcs?state=Queensland&country=australia&brands=jinko,tesla';
  console.log("Fetching:", url);
  try {
    const res = await fetch(url);
    const data = await res.text();
    console.log("Response:", data);
  } catch (err) {
    console.log("Error:", err);
  }
}

test();
