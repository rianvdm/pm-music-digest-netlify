// const LAST_FM_API_TOKEN = '<your-lastfm-api-token>';
// const LASTFM_USERNAME = '<your-lastfm-username>';


export async function onRequest(context) {
  console.log(`Context: ${context.request.url}`);
  console.log(`Username: ${context.env.LASTFM_USERNAME}`);
  return new Response("Hi");
  // const { urlParams } = new URL(context.request.url);
  // let limit = urlParams.get('limit');
  // return new Response(`Hello ${LASTFM_USERNAME}, ${limit} world!`)
}
