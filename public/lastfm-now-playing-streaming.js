async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

async function fetchAndDisplayTrack() {
  try {
    const recentTracksData = await fetchData('/.netlify/functions/getRecentTracks?limit=1');
    const nowPlaying = [recentTracksData.recenttracks.track[0]];

    const artist = nowPlaying[0].artist['#text'];
    const title = nowPlaying[0].name;
    const album = nowPlaying[0].album['#text'];
    const q = `${sanitizeInput(artist)} ${sanitizeInput(title)} ${sanitizeInput(album)}`;

    const spotifyData = await fetchData(`/.netlify/functions/getSpotifySearchResults?type=getTrack&q=${q}`);

    const dataContainer = document.querySelector('.js-spotify-song');
    const spotifyUrl = spotifyData.data.items[0].external_urls.spotify;

    const html = `
      <div class="track_recent">
          <div style="max-width:600px; margin: 0 auto;">
            <div style="position:relative;padding-bottom:calc(56.25% + 52px);height: 0;">
              <iframe style="position:absolute;top:0;left:0;" width="100%" height="100%" src="https://embed.odesli.co/?url=${spotifyUrl}&theme=dark" frameborder="0" allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>
            </div>
          </div>
      </div>
    `;
    dataContainer.innerHTML = html;
  } catch (error) {
    console.error(error);
    displayErrorMessage('.js-spotify-song', 'Oops, it looks like the Spotify API is having some issues. Please try again a little later!');
  }
}

function sanitizeInput(input) {
  return encodeURIComponent(input.replace(/[+&™]/g, ''));
}

function displayErrorMessage(selector, message) {
  const container = document.querySelector(selector);
  const html = `
    <p class="track_recent" style="text-align: center;"><strong>${message}</strong></p>
  `;
  container.innerHTML = html;
}

fetchAndDisplayTrack();
