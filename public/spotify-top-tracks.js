fetch('/getSpotifyTopItems?type=tracks')
  .then(response => response.json())
  .then(async data => {
    const dataContainer = document.querySelector('.js-spotify-top-tracks');
    const topSpotifyTracks = data.items.slice(0, 1);

    const trackPromises = topSpotifyTracks.map(async item => {

      const SpotifyGenres = "rock,indie"
      const spotifyRecommendations = await fetch(`/getSpotifyRecommendations?seed_artists=${item.artists[0].id}&seed_genres=${SpotifyGenres}&seed_tracks=${item.id}`);
      const spotifyRecoData = await spotifyRecommendations.json();
      const spotifyRecoID = spotifyRecoData.tracks.slice(0, 2).map(track => track.id);

      return `
    <p><iframe class="spotify-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/${item.id}"
    width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></p>
    <p><strong>And here are some recommendations for similar songs:</strong></p>
    <p><p><iframe class="spotify-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/${spotifyRecoID[0]}"
    width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></p>
    <p><p><iframe class="spotify-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/${spotifyRecoID[1]}"
    width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></p>
      `;
    });
    const html = await Promise.all(trackPromises);
    dataContainer.innerHTML = html.join('');
  })
  .catch(error => {
    const dataContainer = document.querySelector('.js-spotify-top-tracks');
    dataContainer.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
    console.error(error);
  });
