import fetch from 'node-fetch';

async function test() {
  const url = 'http://localhost:4005/api/customer/epcs?state=Queensland&country=australia&brands=jinko,tesla';
  console.log("Fetching:", url);
  try {
    const res = await fetch(url); // the route uses protectCustomer but maybe it returns 401?
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("Error:", err);
  }
}

test();
