fetch(`/.netlify/functions/getRecentTracks`)
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-now-playing');
    const nowPlaying = [data.recenttracks.track[0]]; 

// Get the data for the artist
fetch(`/.netlify/functions/getArtistInfo?artist=${nowPlaying[0].artist['#text']}`)
  .then(response => response.json())
  .then(data => {
    // Check if artist exists on Last.fm. If it doesn't, don't show artist details.
    const dataContainer = document.querySelector('.js-lastfm-artist-info');
    if (typeof data.artist.tags.tag[0] === 'undefined') {
      const html = `
        <div class="track_none">
          <p style="text-align: center;">Last.fm unfortunately does not have any additional information on ${nowPlaying[0].artist['#text']}.</p>
        </div>
      `;
      dataContainer.innerHTML = html;

      // Show genre and bio if the artist exists on Last.fm
    } else {
      const dataContainer = document.querySelector('.js-lastfm-artist-info');
      const tags = data.artist.tags.tag.map(tag => tag.name);
      const similar = data.artist.similar.artist.map(artist => artist.name);
      const bio = data.artist.bio.summary;
      const html = `
        <div class="track_none">
          <p>If you like <strong>${tags[0]}</strong> and <strong>${tags[1]}</strong> you might enjoy ${nowPlaying[0].artist['#text']}.
          Similar artists include <strong>${similar[0]}</strong>, <strong>${similar[1]}</strong>, and <strong>${similar[2]}</strong>.</p>
            <div class="js-lastfm-top-albums-by-artist">
             <p style="text-align: center;">Loading...</p>
            </div>
        <p>${bio}</p>
        </div>
      `;
      dataContainer.innerHTML = html;
    }
  })

// This closes out the getRecentTracks function
})