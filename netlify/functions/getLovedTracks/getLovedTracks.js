// Get recent loved tracks from last.fm

const lastFMToken = process.env.LAST_FM_API_TOKEN;
const lastFMUser = process.env.LASTFM_USERNAME;

const fetch = require('node-fetch');

const handler = async (event) => {
  const limit = event.queryStringParameters.limit;
  const url = `http://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&user=${lastFMUser}&api_key=${lastFMToken}&format=json&limit=${limit}`
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
