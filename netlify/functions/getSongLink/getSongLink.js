const fetch = require('node-fetch');

const handler = async (event) => {
  const spotifyUrl = event.queryStringParameters.spotifyUrl;
  const url = `https://api.song.link/v1-alpha.1/links?url=${spotifyUrl}`
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
