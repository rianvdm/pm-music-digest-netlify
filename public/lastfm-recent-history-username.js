function fetchUserRecentTracks() {
  const username = document.getElementById('lastFmUsername').value.trim();
  if (!username) {
    console.error('Username is required');
    return; // Exit the function if no username is provided
  }

  fetch(`/.netlify/functions/getRecentTracksUserName?user=${encodeURIComponent(username)}&limit=10`)

  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-lastfm-recent-history');
    const recentTracks = data.recenttracks.track.slice(0, 10);

    if (recentTracks.length > 0) {
      const html = recentTracks.map(track => {

        return `
          <li class="track_recent">
            ${track.name} by ${track.artist['#text']}.
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
