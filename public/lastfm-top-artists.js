fetch('/.netlify/functions/getTopArtists?period=7day&limit=5')
  .then(response => response.json())
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-top-artists');
    const topArtists = data.topartists.artist.slice(0, 5);

    const htmlPromises = topArtists.map(async (artist, i) => {
      const q = `${artist.name}`;
      const spotifyResponse = await fetch(`/.netlify/functions/getSpotifySearchResults?type=getArtist&q=${encodeURIComponent(q)}`);
      const spotifyData = await spotifyResponse.json();
      const spotifyArtistID = spotifyData.data.items[0].id;
      const spotifyArtistImgUrl = spotifyData.data.items[0].images[1].url;
      const spotifyGenres = spotifyData.data.items[0].genres.slice(0, 3);

      async function getTopTracks(spotifyArtistID) {
        const topTracksResponse = await fetch(`/.netlify/functions/getSpotifyArtistTopTracks?spotifyArtistID=${spotifyArtistID}`);
        const topTracksData = await topTracksResponse.json();
        return topTracksData.slice(0, 3);
      }

      const topTracks = await getTopTracks(spotifyArtistID);

      async function getRelatedArtists(spotifyArtistID) {
        const relatedArtistsResponse = await fetch(`/.netlify/functions/getSpotifyRelatedArtists?spotifyArtistID=${spotifyArtistID}`);
        const relatedArtistsData = await relatedArtistsResponse.json();
        return relatedArtistsData.slice(0, 3);
      }

      const relatedArtists = await getRelatedArtists(spotifyArtistID);

      return `
        <div class="track_ul">
          <img src="${spotifyArtistImgUrl}">
          <div class="no-wrap-text">
            <strong><a href="/search?artist=${artist.name}">${artist.name}</a></strong> (${artist.playcount} plays).
            <br><strong>Genres:</strong> ${
                spotifyGenres && spotifyGenres.length >= 1
                  ? `${spotifyGenres[0]}, ${spotifyGenres[1]}`
                  : "unknown"
            }.
            <br><strong>Most popular songs:</strong> ${
                topTracks && topTracks.length >= 3
                  ? `<a href="https://odesli.co/${topTracks[0].external_urls.spotify}">${topTracks[0].name}</a>, <a href="https://odesli.co/${topTracks[1].external_urls.spotify}">${topTracks[1].name}</a>, and <a href="https://odesli.co/${topTracks[2].external_urls.spotify}">${topTracks[2].name}</a>`
                  : "unknown"
            }.
            <br><strong>Similar artists:</strong> ${
                relatedArtists && relatedArtists.length >= 3
                  ? `<a href="/search?artist=${relatedArtists[0].name}">${relatedArtists[0].name}</a>, <a href="/search?artist=${relatedArtists[1].name}">${relatedArtists[1].name}</a>, and <a href="/search?artist=${relatedArtists[2].name}">${relatedArtists[2].name}</a>`
                  : "unknown"
            }.
          </div>
        </div>
      `;
    });

    const html = await Promise.all(htmlPromises);
    dataContainer.innerHTML = `${html.join('')}`;
  })
  .catch(error => console.error(error));
