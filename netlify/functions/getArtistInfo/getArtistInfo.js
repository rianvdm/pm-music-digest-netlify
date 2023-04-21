const lastFMToken = process.env.LAST_FM_API_TOKEN;
const fetch = require('node-fetch');

const handler = async (event) => {
  // const mbid = event.queryStringParameters.mbid;
  const artist = event.queryStringParameters.artist;

  // Make request to Last.fm API
  // const url = `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&mbid=${mbid}&api_key=${lastFMToken}&format=json`;
  const url = `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artist}&api_key=${lastFMToken}&format=json`;
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
