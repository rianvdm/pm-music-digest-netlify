const PACIFIC_TIMEZONE = 'America/Los_Angeles';
const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };

function getPacificTime(date, options) {
  return date.toLocaleString('en-US', {
    ...options,
    timeZone: PACIFIC_TIMEZONE
  });
}

const fetchJSON = async (url, errorMessage = 'Request failed') => {
  const response = await fetch(url);
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.message || errorMessage);
  }
  return response.json();
};

const handleError = (error, container) => {
  console.error(error);
  container.innerHTML += `<p>Error: ${error.message}</p>`;
};

async function getRecentTracks() {
  try {
    const data = await fetchJSON('/.netlify/functions/getRecentTracks?limit=1');
    const nowPlaying = [data.recenttracks.track[0]];
    const dataContainer = document.querySelector('.js-now-playing');
    
    const artistName = nowPlaying[0].artist['#text']
      .replace(/&/g, '%26')
      .replace(/\+/g, '%2B');
    const encodedName = encodeURIComponent(artistName);

    const lastFmData = await fetchJSON(`/.netlify/functions/getLastfmData?type=getArtistInfo&artist=${encodedName}`);

    let additionalInfo = '';
    if (typeof lastFmData.artist.tags.tag[1] !== 'undefined') {
      const tags = lastFmData.artist.tags.tag
        .map(tag => tag.name.toLowerCase())
        .filter(tag => tag !== "seen live");
      const similar = lastFmData.artist.similar.artist.map(artist => artist.name);

      additionalInfo = `Try it if you like ${tags[0]} music
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
          <p style="text-align: center;">Right now I am listening to <strong>${nowPlaying[0].name}</strong></a> by <strong><a href="/search?artist=${nowPlaying[0].artist['#text']}">${nowPlaying[0].artist['#text']}</strong></a> from the album <strong><a href="/search-album?album=${nowPlaying[0].album['#text']}%20${nowPlaying[0].artist['#text']}">${nowPlaying[0].album['#text']}</a></strong>.
          ${additionalInfo}</p>
        </div>
      `;
    } else {
      const utsDate = new Date(data.recenttracks.track[0].date.uts * 1000);
      formattedDate = getPacificTime(utsDate, optionsDate);
      formattedTime = getPacificTime(utsDate, optionsTime);

      html = `
        <div class="track_none">
          <p style="text-align: center;">Nothing is playing right now. The last song I listened to was <strong>${nowPlaying[0].name}</strong></a> by <strong><a href="/search?artist=${nowPlaying[0].artist['#text']}">${nowPlaying[0].artist['#text']}</strong></a> from the album <strong><a href="/search-album?album=${nowPlaying[0].album['#text']}%20${nowPlaying[0].artist['#text']}">${nowPlaying[0].album['#text']}</a></strong>.
          ${additionalInfo}</p>
        </div>
      `;
    }
    dataContainer.innerHTML = html;
  } catch (error) {
    handleError(error, dataContainer);
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
