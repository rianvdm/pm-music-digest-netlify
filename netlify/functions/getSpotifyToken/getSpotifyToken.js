const fetch = require("node-fetch");

const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

exports.handler = async function(event, context) {
  try {
    // Send a POST request to the Spotify API to retrieve a new access token
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
      },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`
    });

    // If the response is not successful, throw an error
    if (!response.ok) {
      throw new Error(`Failed to fetch access token: ${response.statusText}`);
    }

    // Parse the response JSON and return the access token
    const { access_token } = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ access_token })
    };
  } catch (error) {
    // If an error occurs, return a 500 status code and error message
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }

};

