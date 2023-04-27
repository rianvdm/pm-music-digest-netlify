fetch(`/.netlify/functions/getRecentTracks`)

.then(response => response.json())
.then(data => {
const dataContainer = document.querySelector('.js-now-playing');
const nowPlaying = [data.recenttracks.track[0]];

const artist = nowPlaying[0].artist['#text'];
const title = nowPlaying[0].name;
const q = `${artist} ${title}`;

fetch(`/.netlify/functions/getSpotifySong?q=${q}`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch Spotify song');
    }
    return response.json();
  })
  .then(data => {
    const dataContainer = document.querySelector('.js-spotify-song');
    const spotifyUrl = data.tracks.items[0].external_urls.spotify;
    const spotifyID = data.tracks.items[0].id;

    const html = `
      <div class="track_recent">
        <p style="text-align: center;">You can listen to this track on Spotify below, or <a href="https://songwhip.com/${spotifyUrl}" target="_blank">click here</a> to listen on your favorite streaming service.</p>
        <p><iframe class="spotify-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/${spotifyID}"
        width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></p>
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
