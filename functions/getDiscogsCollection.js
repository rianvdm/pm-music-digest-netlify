export async function onRequest(context) {
  
  const DiscogsToken = context.env.DISCOGS_API_TOKEN;
  const DiscogsUser = context.env.DISCOGS_USERNAME;
  
  const url = `https://api.discogs.com/users/${DiscogsUser}/collection/folders/0/releases?token=${DiscogsToken}&sort=added&sort_order=desc&per_page=10`

  console.log(url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from discogs.com: ${response.statusText}`);
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
