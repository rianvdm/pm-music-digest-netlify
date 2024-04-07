export async function onRequest(context) {
  const access_token = context.env.GENIUS_ACCESS_TOKEN; 

  const { searchParams } = new URL(context.request.url);
  let artistid = searchParams.get('artistid');
  if (!artistid || artistid.trim().length == 0) {
    return new Response(JSON.stringify({ error: "Song ID is required" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = `https://api.genius.com/artists/${artistid}`;

  const headers = new Headers();
  headers.append('Authorization', `Bearer ${access_token}`);

  try {
    const response = await fetch(url, { headers: headers, });
    if (!response.ok) {
      throw new Error(`Failed to fetch data from genius.com: ${response.statusText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({ data: data }), {
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
