export async function onRequest(context) {
  const LASTFM_USERNAME = context.env.LASTFM_USERNAME;
  const LASTFM_API_TOKEN = context.env.LAST_FM_API_TOKEN;
  
  const { searchParams } = new URL(context.request.url);
  let dataType = searchParams.get('type');
  let artist = searchParams.get('artist');
  let period = searchParams.get('period');

  let url;

  const urlTemplates = {
    topAlbumsByArtist: (artist) => artist ? `http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${artist}&api_key=${LASTFM_API_TOKEN}&format=json` : null,
    getArtistInfo: (artist) => artist ? `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artist}&api_key=${LASTFM_API_TOKEN}&format=json` : null,
  };

  if (urlTemplates.hasOwnProperty(dataType) && urlTemplates[dataType](artist || period)) {
    url = urlTemplates[dataType](artist || period);
  } else {
    return {
      statusCode: 400,
      body: 'Invalid request. Please provide a valid data type and an artist name or period (if required).'
    };
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from audioscrobbler: ${response.statusText}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
