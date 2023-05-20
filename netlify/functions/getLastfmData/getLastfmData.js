const lastFMToken = process.env.LAST_FM_API_TOKEN;
const lastFMUser = process.env.LASTFM_USERNAME;

const fetch = require('node-fetch');

const handler = async (event) => {
  const dataType = event.queryStringParameters.type;
  const artist = event.queryStringParameters.artist;
  const period = event.queryStringParameters.period;
  let url;

const urlTemplates = {
  topAlbumsByArtist: (artist) => artist ? `http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${artist}&api_key=${lastFMToken}&format=json` : null,
  getArtistInfo: (artist) => artist ? `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artist}&api_key=${lastFMToken}&format=json` : null,
//  getMyTopAlbums: (period) => period ? `http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${lastFMUser}&api_key=${lastFMToken}&period=${period}&format=json` : null,
//  getMyTopTracks: (period) => period ? `http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${lastFMUser}&api_key=${lastFMToken}&period=${period}&format=json` : null,
//  getMyTopArtists: () => `http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${lastFMUser}&api_key=${lastFMToken}&period=7day&format=json`,
//  getMyLovedTracks: () => `http://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&user=${lastFMUser}&api_key=${lastFMToken}&limit=10&format=json`,
//  getMyRecentTracks: () => `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastFMUser}&api_key=${lastFMToken}&limit=20&format=json`,
//  getMyUserInfo: () => `http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${lastFMUser}&api_key=${lastFMToken}&format=json`,
};

if (urlTemplates.hasOwnProperty(dataType) && urlTemplates[dataType](artist || period)) {
  url = urlTemplates[dataType](artist || period);
} else {
  return {
    statusCode: 400,
    body: 'Invalid request. Please provide a valid data type (topArtists or topAlbumsByArtist) and an artist name or period (if required).'
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
