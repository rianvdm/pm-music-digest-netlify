const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    const query = event.queryStringParameters.q; // Get the search query from the URL query parameters

    // Get the URL of the getSpotifyToken function from an environment variable
    const getTokenUrl = process.env.GET_SPOTIFY_TOKEN_URL;

    // Call the getSpotifyToken function to retrieve an access token
    const tokenResponse = await fetch(getTokenUrl);
    const { access_token } = await tokenResponse.json();

    // Send a GET request to the Spotify API to search for the song
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album`, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    // If the response is not successful, throw an error
    if (!response.ok) {
      throw new Error(`Failed to search for song: ${response.statusText}`);
    }

    // Parse the response JSON and return the search results
    const { albums } = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ albums })
    };
  } catch (error) {
    // If an error occurs, return a 500 status code and error message
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
