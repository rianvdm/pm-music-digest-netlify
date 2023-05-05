fetch(`/.netlify/functions/getRecentTracks`)

.then(response => response.json())
.then(data => {
// const dataContainer = document.querySelector('.js-now-playing');
const nowPlaying = [data.recenttracks.track[0]];

const artist = encodeURIComponent(nowPlaying[0].artist['#text'].replace('&', ''));
const title = encodeURIComponent(nowPlaying[0].name.replace('&', ''));
const album = encodeURIComponent(nowPlaying[0].album['#text'].replace('&', ''));
const q = `${artist} ${title} ${album}`;

// fetch(`/.netlify/functions/getSpotifySearchResults-OG?type=getTrack&q=${q}`)
fetch(`/.netlify/functions/getSpotifySearchResults?type=getTrack&q=${q}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch Spotify song');
    }
    return response.json();
  })
  .then(data => {
    const dataContainer = document.querySelector('.js-spotify-song');
    const spotifyUrl = data.data.items[0].external_urls.spotify;
    const spotifyID = data.data.items[0].id;

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
  })
  .catch(error => {
    console.error(error);
    // display error message to user
    const dataContainer = document.querySelector('.js-spotify-song');
    const html = `
      <p class="track_recent" style="text-align: center;"><strong>Oops, it looks like the Spotify API is having some issues.</strong> Please try again a little later!</p>
    `;
    dataContainer.innerHTML = html;
  });

  })
.catch(error => console.error(error));
