const PACIFIC_TIMEZONE = 'America/Los_Angeles';
const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };

function getPacificTime(date, options) {
  return date.toLocaleString('en-US', {
    ...options,
    timeZone: PACIFIC_TIMEZONE
  });
}

const fetchNowPlayingData = async (url, errorMessage = 'Request failed') => {
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

function sanitizeInput(input) {
  return encodeURIComponent(input.replace(/[+&™]/g, ''));
}

async function fetchAndDisplayTrack() {
  try {
    const recentTracksData = await fetchNowPlayingData('/getRecentTracks?limit=1');
    const nowPlaying = [recentTracksData.recenttracks.track[0]];

    const artist = nowPlaying[0].artist['#text'];
    const title = nowPlaying[0].name;
    const album = nowPlaying[0].album['#text'];
    const q = `${sanitizeInput(title)} ${sanitizeInput(artist)} ${sanitizeInput(album)}`;

    const [lastFmData, spotifyData] = await Promise.all([
      fetchNowPlayingData(`/getLastfmData?type=getArtistInfo&artist=${encodeURIComponent(artist)}`),
      fetchNowPlayingData(`/getSpotifySearchResults?type=getTrack&q=${q}`)
    ]);

    displayRecentTracks(nowPlaying, lastFmData);

    const dataContainer = document.querySelector('.js-spotify-song');
    const spotifyUrl = spotifyData.data.items[0].external_urls.spotify;
    const spotifyID = spotifyData.data.items[0].id;

    let html = `
      <div class="track_recent">
        <p><iframe class="spotify-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/${spotifyID}"
        width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></p>
      </div>
      <p id="placeholder" style="text-align: center;">Generating streaming link...</p>
    `;
    dataContainer.innerHTML = html;

    const songLinkData = await fetchNowPlayingData(`/getSongLink?spotifyUrl=${spotifyUrl}`);
    const songLinkUrl = songLinkData.pageUrl;

    const placeholderElement = document.querySelector('#placeholder');
    placeholderElement.innerHTML = `Want to share this song? Copy <a href="${songLinkUrl}" target="_blank">this URL</a> for a universal streaming link.`;
  } catch (error) {
    console.error(error);
    displayErrorMessage('.js-spotify-song', 'Oops, it looks like the Spotify API is having some issues. Please try again a little later!');
  }
}

async function displayRecentTracks(nowPlaying, lastFmData) {
  try {
    const dataContainer = document.querySelector('.js-now-playing');
    
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

      html = getTrackHtml(nowPlaying[0], formattedDate, formattedTime, additionalInfo, true);
    } else {
      const utsDate = new Date(nowPlaying[0].date.uts * 1000);
      formattedDate = getPacificTime(utsDate, optionsDate);
      formattedTime = getPacificTime(utsDate, optionsTime);

      html = getTrackHtml(nowPlaying[0], formattedDate, formattedTime, additionalInfo, false);
    }
    dataContainer.innerHTML = html;
  } catch (error) {
    handleError(error, dataContainer);
  }
}

function getTrackHtml(track, formattedDate, formattedTime, additionalInfo, isNowPlaying) {
  const trackTemplate = `
    <div class="track_none">
      <p style="text-align: center;">${isNowPlaying ? `Right now (${formattedTime} PT on ${formattedDate}) I am listening to` : `The last song I listened to at ${formattedTime} PT on ${formattedDate} was`} <strong><a href="/search-song?song=${track.name}%20${track.artist['#text']}">${track.name}</strong></a> by <strong><a href="/search?artist=${track.artist['#text']}">${track.artist['#text']}</strong></a> from the album <strong><a href="/search-album?album=${track.album['#text']}%20${track.artist['#text']}">${track.album['#text']}</a></strong>.
      ${additionalInfo}</p>
    </div>
  `;
  return trackTemplate;
}

function displayErrorMessage(selector, message) {
  const container = document.querySelector(selector);
  const html = `
    <p class="track_recent" style="text-align: center;"><strong>${message}</strong></p>
  `;
  container.innerHTML = html;
}

fetchAndDisplayTrack();
