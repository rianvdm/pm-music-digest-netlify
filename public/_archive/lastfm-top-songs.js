fetch('/.netlify/functions/getTopSongs')
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-lastfm-top-songs');
    const topSongs = data.toptracks.track.slice(0, 3);

      const html = topSongs.map(track => `
        <div class="track">
            <a href="${track.url}" target="_blank" class="track_link">
            <img src="${track.image[3]['#text']}" class="track_image">
            <div class="track_content">
              <h2 class="track_artist">${track.name}</h2>
              <p class="track_name">${track.artist.name}</p></a>
              <p class="track_album">Played ${track.playcount} times</p>
            </div>
        </div>
      `).join('');
      dataContainer.innerHTML = html;
  
  })
  .catch(error => console.error(error));
