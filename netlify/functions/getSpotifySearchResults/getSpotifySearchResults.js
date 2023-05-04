const fetch = require("node-fetch");
const Redis = require("ioredis");

exports.handler = async function(event, context) {
  try {
    const query = event.queryStringParameters.q; // Get the search query from the URL query parameters
    const dataType = event.queryStringParameters.type; // Get the dataType from the URL query parameters
    let url;

    const getTokenUrl = process.env.GET_SPOTIFY_TOKEN_URL;

    console.log('Creating Redis client');
      const client = new Redis(process.env.REDIS_URL, {
      connectTimeout: 10000,
    });

    console.log('Retrieving access token and expiration time from Redis');
    let access_token = await client.get("spotify_access_token");
    let expires_at_str = await client.get("spotify_expires_at");
    let expires_at = parseInt(expires_at_str, 10);
    console.log(expires_at);

    if (!access_token || !expires_at || Date.now() >= expires_at) {
      console.log('Fetching new access token');
      const tokenResponse = await fetch(getTokenUrl);
      const tokenData = await tokenResponse.json();
      console.log(tokenData);
      access_token = tokenData.access_token;
      expires_at = Date.now() + tokenData.expires_in * 1000;
      console.log(expires_at);

      console.log('Storing new access token and expiration time in Redis');
      await client.set("spotify_access_token", access_token);
      await client.set("spotify_expires_at", expires_at);
    } else {
      console.log('Using existing access token from Redis');
      console.log(expires_at);
    }

    console.log('Quitting Redis client');
    await client.quit();

    const urlTemplates = {
      getTrack: (query) => `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
      getAlbum: (query) => `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=20`,
      getArtist: (query) => `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=20`
    };

    if (urlTemplates.hasOwnProperty(dataType) && query) {
      url = urlTemplates[dataType](query);
    } else {
      return {
        statusCode: 400,
        body: 'Invalid request. Please provide a valid data type and query.'
      };
    }


    // Send a GET request to the Spotify API to search for the song
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    // If the response is not successful, throw an error
    if (!response.ok) {
      throw new Error(`Failed to search for song: ${response.statusText}`);
    }

    // Parse the response JSON
    const jsonResponse = await response.json();

    // Return the relevant data depending on the dataType parameter
    let resultData;
    if (dataType === 'getTrack') {
      resultData = jsonResponse.tracks;
    } else if (dataType === 'getAlbum') {
      resultData = jsonResponse.albums;
    } else if (dataType === 'getArtist') {
      resultData = jsonResponse.artists;
    }


      return {
        statusCode: 200,
        body: JSON.stringify({ data: resultData }),
      };

      
  } catch (error) {
    // If an error occurs, return a 500 status code and error message
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
