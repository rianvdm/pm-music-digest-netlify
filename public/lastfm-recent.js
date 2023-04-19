fetch('/.netlify/functions/getRecentTracks')
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-lastfm-recent');
    const recentTracks = data.recenttracks.track.slice(0, 5);

    if (recentTracks.length > 0) {
      const html = recentTracks.map(track => `
        <div class="track">
           <p> <a href="${track.url}" target="_blank" class="track_link">${track.name}</a> by ${track.artist['#text']}</p>
          </a>
        </div>
      `).join('');
      dataContainer.innerHTML = html;
    } else {
      const html = `
        <div class="track">
          <h2 class="track_artist">Nothing has been played recently.</h2>
        </div>
      `;
      dataContainer.innerHTML = html;
    }
  })
  .catch(error => console.error(error));
