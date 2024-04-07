export async function onRequest(context) {
  const LASTFM_USERNAME = context.env.LASTFM_USERNAME;
  const LASTFM_API_TOKEN = context.env.LAST_FM_API_TOKEN;
  
  const { searchParams } = new URL(context.request.url);
  let limit = searchParams.get('limit');
  if (!limit || isNaN(parseInt(limit))) {
    limit = 1; 
  }

  const url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LAST_FM_API_TOKEN}&limit=${limit}&format=json`;
  console.log(`${url}`);
  // try {
  //   const response = await fetch(url);
  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch data from Last.fm: ${response.statusText}`);
  //   }
  //
  //   const data = await response.json();
  //   return new Response(JSON.stringify(data), {
  //     status: 200,
  //     headers: { 'Content-Type': 'application/json' },
  //   });
  // } catch (error) {
  //   return new Response(JSON.stringify({ error: error.message }), {
  //     status: 500,
  //     headers: { 'Content-Type': 'application/json' },
  //   });
  // }
}
