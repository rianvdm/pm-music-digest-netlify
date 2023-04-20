// Get latest additions to Dicogs

const DiscogsToken = process.env.DISCOGS_API_TOKEN;
const DiscogsUser = 'elezea-records';

const fetch = require('node-fetch');

const handler = async () => {
  const url = `https://api.discogs.com/users/${DiscogsUser}/collection/folders/0/releases?token=${DiscogsToken}&sort=added&sort_order=desc&per_page=10`
  const results = await fetch(url);

  // If there was an error
  if (!results.ok) {
    console.error(results);

    return {
      statusCode: 500,
      body: results.statusText
    }
  }

  // Get JSON body from results
  const data = await results.json();

  // Return data
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }
}

module.exports = { handler }
