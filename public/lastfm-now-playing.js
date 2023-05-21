const PACIFIC_TIMEZONE = 'America/Los_Angeles';
const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };

function getPacificTime(date, options) {
  return date.toLocaleString('en-US', {
    ...options,
    timeZone: PACIFIC_TIMEZONE
  });
}

async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

async function getRecentTracks() {
  try {
    const data = await fetchData('/.netlify/functions/getRecentTracks?limit=1');
    const dataContainer = document.querySelector('.js-now-playing');
    const nowPlaying = [data.recenttracks.track[0]];

    const artistName = nowPlaying[0].artist['#text']
      .replace(/&/g, '%26')
      .replace(/\+/g, '%2B');
    const encodedName = encodeURIComponent(artistName);

    const lastFmData = await fetchData(`/.netlify/functions/getLastfmData?type=getArtistInfo&artist=${encodedName}`);
    
    let additionalInfo = '';
    if (typeof lastFmData.artist.tags.tag[1] !== 'undefined') {
      const tags = lastFmData.artist.tags.tag
        .map(tag => tag.name.toLowerCase())
        .filter(tag => tag !== "seen live");
      const similar = lastFmData.artist.similar.artist.map(artist => artist.name);

      additionalInfo = `Try it if you like <strong>${tags[0]}</strong> and <strong>${tags[1]}</strong> music
                        from artists like <a href="/search?artist=${similar[0]}">${similar[0]}</a>, <a href="/search?artist=${similar[1]}">${similar[1]}</a>, and <a href="/search?artist=${similar[2]}">${similar[2]}</a>.`;
    } else {
      additionalInfo = "Last.fm unfortunately does not have any additional information about this song.";
    }

    let formattedDate, formattedTime, html;
    if (nowPlaying[0].hasOwnProperty('@attr') && nowPlaying[0]['@attr'].hasOwnProperty('nowplaying') && nowPlaying[0]['@attr'].nowplaying === 'true') {
      const dateNow = new Date();
      formattedDate = getPacificTime(dateNow, optionsDate);
      formattedTime = getPacificTime(dateNow, optionsTime);

      html = `
        <div class="track_none">
          <p style="text-align: center;">Right now (${formattedTime} PT on ${formattedDate}) I am listening to <strong><a href="/search-song?song=${nowPlaying[0].name}%20${nowPlaying[0].artist['#text']}">${nowPlaying[0].name}</strong></a> by <strong><a href="/search?artist=${nowPlaying[0].artist['#text']}">${nowPlaying[0].artist['#text']}</strong></a> from the album <strong><a href="/search-album?album=${nowPlaying[0].album['#text']}%20${nowPlaying[0].artist['#text']}">${nowPlaying[0].album['#text']}</a></strong>.
          ${additionalInfo}</p>
        </div>
      `;
    } else {
      const utsDate = new Date(data.recenttracks.track[0].date.uts * 1000);
      formattedDate = getPacificTime(utsDate, optionsDate);
      formattedTime = getPacificTime(utsDate, optionsTime);

      html = `
        <div class="track_none">
          <p style="text-align: center;">Nothing is playing right now. The last song I listened to at ${formattedTime} PT on ${formattedDate} was <strong>${nowPlaying[0].name}</strong> by <strong><a href="/search?artist=${nowPlaying[0].artist['#text']}">${nowPlaying[0].artist['#text']}</strong></a> from the album <strong><a href="/search-album?album=${nowPlaying[0].album['#text']}%20${nowPlaying[0].artist['#text']}">${nowPlaying[0].album['#text']}</a></strong>.
          ${additionalInfo}</p>
        </div>
      `;
      }
      dataContainer.innerHTML = html;

      } catch (error) {
        console.error(error);
      }
      }

getRecentTracks();


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
