const lastFMToken = process.env.LAST_FM_API_TOKEN;
const lastFMUser = 'bordesak';

const fetch = require('node-fetch');

const handler = async (event) => {
  const dataType = event.queryStringParameters.type;
  const artist = event.queryStringParameters.artist;
  let url;

  if (dataType === 'topArtists') {
    url = `http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${lastFMUser}&api_key=${lastFMToken}&period=7day&format=json`;
  } else if (dataType === 'topAlbumsByArtist' && artist) {
    url = `http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${artist}&api_key=${lastFMToken}&format=json`;
  } else if (dataType === 'getArtistInfo' && artist) {
    url = `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artist}&api_key=${lastFMToken}&format=json`;
  }
  else {
    return {
      statusCode: 400,
      body: 'Invalid request. Please provide a valid data type (topArtists or topAlbumsByArtist) and an artist name (if required).'
    };
  }

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
