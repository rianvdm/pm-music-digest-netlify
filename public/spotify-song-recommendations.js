const fetch = require("node-fetch");

async function getSongRecommendations(seed_artists, seed_genres, seed_tracks) {
  try {
    // Call the Netlify function to retrieve song recommendations
    const response = await fetch(`https://your-netlify-app.netlify.app/.netlify/functions/getSongRecommendations?seed_artists=${encodeURIComponent(seed_artists)}&seed_genres=${encodeURIComponent(seed_genres)}&seed_tracks=${encodeURIComponent(seed_tracks)}`);
    
    // If the response is not successful, throw an error
    if (!response.ok) {
      throw new Error(`Failed to get song recommendations: ${response.statusText}`);
    }

    // Parse the response JSON and return the recommendations
    const { recommendations } = await response.json();
    return recommendations;
  } catch (error) {
    // If an error occurs, log the error and return an empty array
    console.error(error);
    return [];
  }
}

// Call the getSongRecommendations function with some seed values
getSongRecommendations("4NHQUGzhtTLFvgF5SZesLK", "rock", "0c6xIDDpzE81m2q797ordA")
  .then((recommendations) => {
    // Print details about the first three song recommendations
    for (let i = 0; i < 3; i++) {
      const recommendation = recommendations[i];
      console.log(`Name: ${recommendation.name}`);
      console.log(`Artist: ${recommendation.artists[0].name}`);
      console.log(`Album: ${recommendation.album.name}`);
      console.log(`Preview URL: ${recommendation.preview_url}`);
      console.log(`External URL: ${recommendation.external_urls.spotify}`);
      console.log();
    }
  })
  .catch((error) => console.error(error));
