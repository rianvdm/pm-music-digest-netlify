fetch(`/getRecentTracks`)
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-now-playing');
    const nowPlaying = [data.recenttracks.track[0]]; 

// Get the data for the artist's top albums
fetch(`/.netlify/functions/getTopAlbumsByArtist?artist=${nowPlaying[0].artist['#text']}`)
  .then(response => response.json())
  .then(data => {
    // Check if artist exists on Last.fm. If it doesn't, don't show artist details.
    const dataContainer = document.querySelector('.js-lastfm-top-albums-by-artist');
    if (typeof data.topalbums.album[1].name === 'undefined') {
      const html = `
        <div class="track_none">
          <p style="text-align: center;">Last.fm unfortunately does not have any additional information on ${nowPlaying[0].artist['#text']}’s popular albums.</p>
        </div>
      `;
      dataContainer.innerHTML = html;

      // Get top albums
    } else {
      const dataContainer = document.querySelector('.js-lastfm-top-albums-by-artist');
      const topArtistAlbums = data.topalbums.album.map(album => album.name);
      const topArtistAlbumsURLs = data.topalbums.album.map(album => album.url);
      const playcount = data.topalbums.album.map(album => album.playcount);
      const playcount0 = new Intl.NumberFormat().format(playcount[0]);

      const html = `
        <div class="track_none">
          <p>${nowPlaying[0].artist['#text']}’s most popular album is <a href="${topArtistAlbumsURLs[0]}" target="_blank" class="track_link">${topArtistAlbums[0]}</a> with ${new Intl.NumberFormat().format(playcount[0])} total plays on Last.fm. 
          Also check out <a href="${topArtistAlbumsURLs[1]}" target="_blank" class="track_link">${topArtistAlbums[1]}</a>, which has ${new Intl.NumberFormat().format(playcount[1])} total plays.</p>
        </div>
      `;
      dataContainer.innerHTML = html;
    }
  })

// This closes out the getRecentTracks function
})
