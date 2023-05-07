fetch('/.netlify/functions/getRecentTracks')
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-lastfm-recent-history');
    const recentTracks = data.recenttracks.track.slice(1, 11);

    if (recentTracks.length > 0) {
      const html = recentTracks.map(track => {

        const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
        const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };
        const pacificTimezone = 'America/Los_Angeles';
        const utsDate = track.date.uts;
        const formattedDate = new Date(utsDate * 1000).toLocaleString('en-US', { // insert this line
          ...optionsDate,
          timeZone: pacificTimezone
        });
        const formattedTime = new Date(utsDate * 1000).toLocaleString('en-US', { // insert this line
          ...optionsTime,
          timeZone: pacificTimezone
        });

        return `
          <li class="track_recent">
            <a href="${track.url}" target="_blank" class="track_link">${track.name}</a> by ${track.artist['#text']} (${formattedDate} at ${formattedTime} PT).
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
