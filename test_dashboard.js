const axios = require('axios');
const fs = require('fs');

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/employees/dashboard', {
      headers: {
        // Need to provide a valid token for authentication
        // Actually, just reading the backend file might be easier
      }
    });
    fs.writeFileSync('test_output.json', JSON.stringify(res.data, null, 2));
  } catch (err) {
    fs.writeFileSync('test_output.json', JSON.stringify(err.response ? err.response.data : err.message, null, 2));
  }
}
test();
