fetch('/.netlify/functions/getRecentTracks?limit=10')
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-lastfm-recent-history');
    const recentTracks = data.recenttracks.track.slice(0, 10);

    if (recentTracks.length > 0) {
      const html = recentTracks.map(track => {

        return `
          <li class="track_recent">
            <a href="${track.url}" target="_blank" class="track_link">${track.name}</a> by ${track.artist['#text']}.
          </li>
        `;
      }).join('');

      const content = `
        <div class="recent-tracks">
          <p><strong>Here are my 10 most recent tracks:</strong></p>
          <ul>
            ${html}
          </ul>
        </div>
      `;

      dataContainer.innerHTML = content;
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
