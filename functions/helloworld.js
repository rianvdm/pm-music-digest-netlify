export async function onRequest(context) {
  const LASTFM_USERNAME = context.env.LASTFM_USERNAME;
  const LASTFM_API_TOKEN = context.env.LAST_FM_API_TOKEN;
  
  const urlParams = new URL(context.request.url);
  let limit = urlParams.get('limit');
  if (!limit || isNaN(parseInt(limit))) {
    limit = 1; 
  }
  return new Response(`Hello ${LASTFM_USERNAME} with a limit of ${limit}`);
}
