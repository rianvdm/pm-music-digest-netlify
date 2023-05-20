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
};

if (urlTemplates.hasOwnProperty(dataType) && urlTemplates[dataType](artist || period)) {
  url = urlTemplates[dataType](artist || period);
} else {
  return {
    statusCode: 400,
    body: 'Invalid request. Please provide a valid data type and an artist name or period (if required).'
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
