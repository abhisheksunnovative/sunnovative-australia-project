import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch'; // Requires node-fetch or native fetch in Node 18+

const testScanner = async () => {
  console.log('Testing V2 Scanner...');
  // Create a dummy text file to act as a bill
  const dummyPath = path.join(process.cwd(), 'dummy_bill.jpg');
  fs.writeFileSync(dummyPath, 'Dummy bill image for testing MSEDCL Units 100 Account No 123456');

  const formData = new FormData();
  formData.append('billFile', fs.createReadStream(dummyPath));

  try {
    console.log('1. Uploading bill to V2 API...');
    const uploadRes = await fetch('http://localhost:4005/api/v2/light-bill/scan', {
      method: 'POST',
      body: formData
    });
    const uploadData = await uploadRes.json();
    console.log('Upload Response:', uploadData);

    if (uploadData.extraction_id) {
      console.log('\n2. Polling for result in 5 seconds...');
      setTimeout(async () => {
        const resultRes = await fetch('http://localhost:4005/api/v2/light-bill/result/' + uploadData.extraction_id);
        const resultData = await resultRes.json();
        console.log('Extraction Result:', JSON.stringify(resultData, null, 2));
        fs.unlinkSync(dummyPath); // Cleanup
        console.log('\n✅ Testing Complete!');
      }, 5000);
    }
  } catch (err) {
    console.error('Test Failed:', err);
  }
};

testScanner();
