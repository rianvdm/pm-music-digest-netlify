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
        <div class="track_none">
          <p style="text-align: center;">The song I am streaming right now.</p>
        </div>
        <div class="track">
          <a href="${nowPlaying[0].url}" target="_blank" class="track_link">
            <img src="${nowPlaying[0].image[3]['#text']}" class="track_image">
            <div class="track_content">
              <h2 class="track_artist">${nowPlaying[0].name}</h2>
              <p class="track_name">${nowPlaying[0].artist['#text']}</p>
              <p class="track_album">${nowPlaying[0].album['#text']}</p>
            </div>
            </a>
        </div>
    `;
    dataContainer.innerHTML = html;
  } else {

    const utsDate = data.recenttracks.track[0].date.uts;
    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };
    const pacificTimezone = 'America/Los_Angeles';

    const formattedDate = new Date(utsDate * 1000).toLocaleString('en-US', {
      ...optionsDate,
      timeZone: pacificTimezone
    });
    const formattedTime = new Date(utsDate * 1000).toLocaleString('en-US', {
      ...optionsTime,
      timeZone: pacificTimezone
    });

    const html = `
        <div class="track_none">
            <h4 style="text-align:center">Sadly, I'm not listening to anything right now. It's all very very quiet.</h4>
            <p>The last song I listened to was <a href="${nowPlaying[0].url}">${nowPlaying[0].name}</a> by ${nowPlaying[0].artist['#text']} at ${formattedTime} Pacific Time on ${formattedDate}.</p>
        </div>
    `;
    dataContainer.innerHTML = html;

  }
  })
  .catch(error => console.error(error));


