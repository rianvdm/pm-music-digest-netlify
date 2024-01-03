fetch(`/.netlify/functions/getRecentTracks`)
  .then(response => response.json())
  .then(data => {
    // const dataContainer = document.querySelector('.js-now-playing');
    const nowPlaying = [data.recenttracks.track[0]]; 

// Get the data for the artist
const artistName = nowPlaying[0].artist['#text']
  .replace(/&/g, '%26')
  .replace(/\+/g, '%2B');
const encodedName = encodeURIComponent(artistName);

fetch(`/.netlify/functions/getLastfmData?type=getArtistInfo&artist=${encodedName}`)
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

      // Show genre and similar artists if the artist exists on Last.fm
    } else {
      const dataContainer = document.querySelector('.js-lastfm-artist-info');
      const tags = data.artist.tags.tag
        .map(tag => tag.name.toLowerCase())
        .filter(tag => tag !== "seen live");
      const similar = data.artist.similar.artist.map(artist => artist.name);

            // Get the data for the artist's top albums
      fetch(`/.netlify/functions/getLastfmData?type=topAlbumsByArtist&artist=${encodedName}`)
        .then(response => response.json())
        .then(data => {

            const dataContainer = document.querySelector('.js-lastfm-now-playing-artist-info');
            const topArtistAlbums = data.topalbums.album.map(album => album.name);
            const topArtistAlbumsURLs = data.topalbums.album.map(album => album.url);
            const playcount = data.topalbums.album.map(album => album.playcount);
            const playcount0 = new Intl.NumberFormat().format(playcount[0]);
      
      const html = `
        <div class="track_none">
          <p style="text-align: center;">If you like <strong>${tags[0]}</strong> and <strong>${tags[1]}</strong> you might enjoy ${nowPlaying[0].artist['#text']}.
          Similar artists include <strong>${similar[0]}</strong>, <strong>${similar[1]}</strong>, and <strong>${similar[2]}</strong>.
          ${nowPlaying[0].artist['#text']}’s most popular album is <a href="${topArtistAlbumsURLs[0]}" target="_blank">${topArtistAlbums[0]}</a> with ${new Intl.NumberFormat().format(playcount[0])} total plays on Last.fm. 
          </p>
        </div>
      `;
      dataContainer.innerHTML = html;
      })

    }
  })

// This closes out the getRecentTracks function
})