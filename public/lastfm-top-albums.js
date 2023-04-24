fetch('/.netlify/functions/getTopAlbums')
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-lastfm-top-albums');
    const topAlbums = data.topalbums.album.slice(0, 6);

      const html = topAlbums.map(album => `
        <div class="track">
            <a href="${album.url}" target="_blank" class="track_link">
            <img src="${album.image[3]['#text']}" class="track_image">
            <div class="track_content">
              <h2 class="track_artist">${album.name}</h2></a>
              <p class="track_name">${album.artist.name}</p>
              <p class="track_album">${album.playcount} songs played
              <br><a href="https://songwhip.com/create?q=${album.name} ${album.artist.name}" target="_blank">Stream now</a></p>
            </div>
        </div>
      `).join('');
      dataContainer.innerHTML = html;
  
  })
  .catch(error => console.error(error));
