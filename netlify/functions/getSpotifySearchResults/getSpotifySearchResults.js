const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    const query = event.queryStringParameters.q; // Get the search query from the URL query parameters
    const dataType = event.queryStringParameters.type; // Get the dataType from the URL query parameters
    let url;

    // Get the URL of the getSpotifyToken function from an environment variable
    const getTokenUrl = process.env.GET_SPOTIFY_TOKEN_URL;

    // Call the getSpotifyToken function to retrieve an access token
    const tokenResponse = await fetch(getTokenUrl);
    const { access_token } = await tokenResponse.json();

    const urlTemplates = {
      getTrack: (query) => `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`,
      getAlbum: (query) => `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album`,
      getArtist: (query) => `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist`
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
