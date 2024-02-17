const fetch = require('node-fetch');

const lastFMToken = process.env.LAST_FM_API_TOKEN;

const handler = async (event) => {
  const limit = event.queryStringParameters.limit;
  // Extract the username from the query string parameters
  const lastFMUser = event.queryStringParameters.user;

  // Check if lastFMUser is provided, if not, return an error response
  if (!lastFMUser) {
    return {
      statusCode: 400, // Bad Request
      body: JSON.stringify({ error: "User parameter is missing" })
    };
  }

  const url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastFMUser}&api_key=${lastFMToken}&limit=${limit}&format=json`
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
