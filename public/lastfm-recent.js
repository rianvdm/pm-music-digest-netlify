fetch('/.netlify/functions/getRecentTracks')
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-lastfm-recent');
    const recentTracks = data.recenttracks.track.slice(0, 10);

    if (recentTracks.length > 0) {
      const html = recentTracks.map(track => `
      <li class="track_recent">
         <a href="${track.url}" target="_blank" class="track_link">${track.name}</a> by ${track.artist['#text']}
      </li>
      `).join('');
      dataContainer.innerHTML = `<ul>${html}</ul>`;
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
