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
    const q = `${sanitizeInput(title)} ${sanitizeInput(artist)} ${sanitizeInput(album)}`;

    const spotifyData = await fetchData(`/.netlify/functions/getSpotifySearchResults?type=getTrack&q=${q}`);

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

    const songLinkData = await fetchData(`/.netlify/functions/getSongLink?spotifyUrl=${spotifyUrl}`);
    const songLinkUrl = songLinkData.pageUrl;

    const placeholderElement = document.querySelector('#placeholder');
    placeholderElement.innerHTML = `Want to share this song with a friend? Copy <a href="${songLinkUrl}" target="_blank">this URL</a> for a universal streaming link.`;
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


      // <div class="track_recent">
      //     <div style="max-width:600px; margin: 0 auto;">
      //       <div style="position:relative;padding-bottom:calc(56.25% + 52px);height: 0;">
      //         <iframe style="position:absolute;top:0;left:0;" width="100%" height="100%" src="https://embed.odesli.co/?url=${spotifyUrl}&theme=dark" frameborder="0" allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>
      //       </div>
      //     </div>
      // </div>