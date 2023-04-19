//------------------------------------------
// Fetch tracks
//------------------------------------------
fetch('/.netlify/functions/getRecentTracks')
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-now-playing');
    const nowPlaying = [data.recenttracks.track[0]];

    if (nowPlaying[0].hasOwnProperty('@attr') && 
        nowPlaying[0]['@attr'].hasOwnProperty('nowplaying') && 
        nowPlaying[0]['@attr'].nowplaying === 'true') {

    const html = `
        <div class="track">
          <a href="${nowPlaying[0].url}" target="_blank" class="track_link">
            <img src="${nowPlaying[0].image[3]['#text']}" class="track_image">
            <div class="track_content">
              <h2 class="track_artist">${nowPlaying[0].artist['#text']}</h2>
              <p class="track_name">${nowPlaying[0].name}</p>
              <p class="track_album">${nowPlaying[0].album['#text']}</p>
            </div>
          </a>
        </div>
    `;
    dataContainer.innerHTML = html;
  } else {

    const html = `
        <div class="track">
              <h2 class="track_artist">Nothing is playing right now. It's all very very quiet.</h2>
        </div>
    `;
    dataContainer.innerHTML = html;

  }
  })
  .catch(error => console.error(error));

