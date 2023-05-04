const fetch = require("node-fetch");
const Redis = require("ioredis");

const client = new Redis(process.env.REDIS_URL);

// Delete the Spotify access token and expiration time keys
client.del('spotify_access_token');
client.del('spotify_expires_at');

// Quit the Redis client
client.quit();

exports.handler = async function (event, context) {
  try {
    const seed_artists = event.queryStringParameters.seed_artists;
    const seed_genres = event.queryStringParameters.seed_genres;
    const seed_tracks = event.queryStringParameters.seed_tracks;

    // const getTokenUrl = process.env.GET_SPOTIFY_TOKEN_URL;
    const getTokenUrl = "redis://default:mZuiG13KhdhmuGqUq3MIqHLnYetD8sDr@redis-19507.c114.us-east-1-4.ec2.cloud.redislabs.com:19507";

    console.log('Creating Redis client');
    const client = new Redis(process.env.REDIS_URL, {
      connectTimeout: 10000,
    });

    client.on('error', (error) => {
      console.error('Error in Redis client:', error);
    });

    console.log('Retrieving access token and expiration time from Redis');
    let access_token = await client.get("spotify_access_token");
    let expires_at_str = await client.get("spotify_expires_at");
    let expires_at = parseInt(expires_at_str, 10);
    console.log(expires_at);

    if (!access_token || !expires_at || Date.now() >= expires_at) {
      console.log('Fetching new access token');
      const tokenResponse = await fetch(getTokenUrl);
      const tokenData = await tokenResponse.json();
      console.log(tokenData);
      access_token = tokenData.access_token;
      expires_at = Date.now() + tokenData.expires_in * 1000;
      console.log(expires_at);

      console.log('Storing new access token and expiration time in Redis');
      await client.set("spotify_access_token", access_token);
      await client.set("spotify_expires_at", expires_at);
    } else {
      console.log('Using existing access token from Redis');
      console.log(expires_at);
    }

    console.log('Quitting Redis client');
    await client.quit();

    const requestUrl = `https://api.spotify.com/v1/recommendations?limit=10&seed_artists=${seed_artists}&seed_genres=${seed_genres}&seed_tracks=${seed_tracks}&limit=2`;

    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};