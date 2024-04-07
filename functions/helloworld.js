const LAST_FM_API_TOKEN = '<your-lastfm-api-token>';
const LASTFM_USERNAME = '<your-lastfm-username>';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const { urlParams } = new URL(request.url);
  let limit = urlParams.get('limit');
  return new Response(`Hello ${LASTFM_USERNAME}, ${limit} world!`)
}
