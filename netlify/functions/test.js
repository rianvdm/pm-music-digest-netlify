addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const LAST_FM_API_TOKEN = '<your-lastfm-api-token>';
const LASTFM_USERNAME = '<your-lastfm-username>';

async function handleRequest(request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  const url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LAST_FM_API_TOKEN}&limit=${limit}&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from Last.fm: ${response.statusText}`);
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

