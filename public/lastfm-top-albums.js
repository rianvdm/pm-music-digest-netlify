fetch('/.netlify/functions/getTopAlbums?period=7day')
  .then(response => response.json())
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-top-albums');
    const topAlbums = data.topalbums.album.slice(0, 6);

    const htmlPromises = topAlbums.map(async album => {
      const spotifyResponse = await fetch(`/.netlify/functions/getSpotifySearchResults?type=getAlbum&q=${encodeURIComponent(`${album.name} ${album.artist.name}`)}`);
      const spotifyData = await spotifyResponse.json();
      const spotifyAlbumUrl = spotifyData.data.items[0].external_urls.spotify;
      return `
        <div class="track">
          <a href="${album.url}" target="_blank" class="track_link">
            <img src="${album.image[3]['#text']}" class="track_image">
            <div class="track_content">
              <h2 class="track_artist">${album.name}</h2></a>
              <p class="track_name">${album.artist.name}</p>
              <p class="track_album">${album.playcount} songs played</p>
              <a href="https://odesli.co/${spotifyAlbumUrl}" target="_blank" class="track_album">Stream now</a>
            </div>
          </div>
      `;
    });
    const html = await Promise.all(htmlPromises);
    dataContainer.innerHTML = html.join('');
  })
  .catch(error => console.error(error));
