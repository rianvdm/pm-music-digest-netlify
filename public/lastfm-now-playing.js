fetch('/.netlify/functions/getRecentTracks?limit=1')
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-now-playing');
    const nowPlaying = [data.recenttracks.track[0]];

    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
    const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };
    const pacificTimezone = 'America/Los_Angeles';

    const formattedDateNow = new Date().toLocaleString('en-US', {
      ...optionsDate,
      timeZone: pacificTimezone
    });

    const formattedTimeNow = new Date().toLocaleString('en-US', {
      ...optionsTime,
      timeZone: pacificTimezone
    });

    const artistName = nowPlaying[0].artist['#text']
      .replace(/&/g, '%26')
      .replace(/\+/g, '%2B');
    const encodedName = encodeURIComponent(artistName);

    return fetch(`/.netlify/functions/getLastfmData?type=getArtistInfo&artist=${encodedName}`)
      .then(response => response.json())
      .then(lastFmData => {
        let additionalInfo = '';
        if (typeof lastFmData.artist.tags.tag[1] !== 'undefined') {
          const tags = lastFmData.artist.tags.tag
            .map(tag => tag.name.toLowerCase())
            .filter(tag => tag !== "seen live");
          const similar = lastFmData.artist.similar.artist.map(artist => artist.name);

          additionalInfo = `Try this song if you like <strong>${tags[0]}</strong> and <strong>${tags[1]}</strong> music
                          from artists like ${similar[0]}, ${similar[1]}, and ${similar[2]}.`;
        } else {
          additionalInfo = "Last.fm unfortunately does not have any additional information about this song.";
        }

        if (nowPlaying[0].hasOwnProperty('@attr') && nowPlaying[0]['@attr'].hasOwnProperty('nowplaying') && nowPlaying[0]['@attr'].nowplaying === 'true') {
          const html = `
            <div class="track_none">
              <p style="text-align: center;">Right now (${formattedTimeNow} PT on ${formattedDateNow}) I am listening to <strong>${nowPlaying[0].name}</strong> by <strong><a href="/search?artist=${nowPlaying[0].artist['#text']}">${nowPlaying[0].artist['#text']}</strong></a> from the album <strong>${nowPlaying[0].album['#text']}</strong>.
              ${additionalInfo}</p>
            </div>
          `;
          dataContainer.innerHTML = html;
        } else {
          const utsDate = data.recenttracks.track[0].date.uts;

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
              <p style="text-align: center;">Nothing is playing right now. The last song I listened to at ${formattedTime} PT on ${formattedDate} was <strong>${nowPlaying[0].name}</strong> by <strong><a href="/search?artist=${nowPlaying[0].artist['#text']}">${nowPlaying[0].artist['#text']}</strong></a> from the album <strong>${nowPlaying[0].album['#text']}</strong>.
              ${additionalInfo}</p>
              
            </div>
          `;
          dataContainer.innerHTML = html;
          }
      })
  })
  .catch(error => console.error(error));



// Code to display the Last.fm details
// <div class="track">
//   <a href="${nowPlaying[0].url}" target="_blank" class="track_link">
//     <img src="${nowPlaying[0].image[3]['#text']}" class="track_image">
//     <div class="track_content">
//       <h2 class="track_artist">${nowPlaying[0].name}</h2></a>
//       <p class="track_name">${nowPlaying[0].artist['#text']}</p>
//       <p class="track_album">${nowPlaying[0].album['#text']}</p>
//     </div>
// </div>
