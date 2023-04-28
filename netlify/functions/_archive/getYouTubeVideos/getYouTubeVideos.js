// Search for a track on YouTune

const youtubeToken = process.env.YOUTUBE_API_TOKEN;

const fetch = require('node-fetch');

const handler = async (event) => {
  const q = event.queryStringParameters.q;

  // Make request to YouTune API
  const url = `https://www.googleapis.com/youtube/v3/search?key=${youtubeToken}&part=snippet&q=${q}&maxResults=5`;
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
