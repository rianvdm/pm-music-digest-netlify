const fetchTopAlbumsJSON = async (url, errorMessage = 'Request failed') => {
  console.log(`fetchTopAlbumsJSON called with URL: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.message || errorMessage);
  }
  return response.json();
};

const handleTopAlbumsError = (error, container) => {
  console.error(error);
  container.innerHTML += `<p>Error: ${error.message}</p>`;
};

const fetchAlbumData = async (album) => {
  try {
    const url = `/getSpotifySearchResults?type=getAlbum&q=${encodeURIComponent(`${album.name} ${album.artist.name}`)}`;
    console.log(`fetchAlbumData called with URL: ${url}`);
    const spotifyData = await fetchTopAlbumsJSON(url);
    const spotifyAlbumUrl = spotifyData.data.items[0].external_urls.spotify;
    return { album, spotifyAlbumUrl };
  } catch (error) {
    console.log(`fetchAlbumData error with album: ${JSON.stringify(album)}`);
    handleTopAlbumsError(error, document.querySelector('.js-lastfm-top-albums'));
  }
};

document.querySelector('.js-lastfm-top-albums').innerHTML = `<p style="text-align: center;">Loading...</p>`;
fetchTopAlbumsJSON('/getTopAlbums?period=1month&limit=6')
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-top-albums');
    const topAlbums = data.topalbums.album.slice(0, 6);

    const albumData = await Promise.all(topAlbums.map(fetchAlbumData));

    const html = albumData.map(({ album, spotifyAlbumUrl }) => `
        <div class="track">
          <a href="/search-album?album=${album.name}%20${album.artist.name}">
            <img src="${album.image[3]['#text']}" class="track_image">
            <div class="track_content">
              <h2 class="track_artist">${album.name}</h2></a>
              <p class="track_name">${album.artist.name}</p>
              <p class="track_album">${album.playcount} songs played</p>
              <a href="https://odesli.co/${spotifyAlbumUrl}" target="_blank" class="track_album">Stream now</a>
            </div>
          </div>
    `);

    dataContainer.innerHTML = html.join('');
  })
  .catch(error => handleTopAlbumsError(error, document.querySelector('.js-lastfm-top-albums')));
