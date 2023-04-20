fetch('/.netlify/functions/getTopArtists')
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-lastfm-top-artists');
    const topArtists = data.topartists.artist.slice(0, 5);

      const html = topArtists.map(artist => `
        <div class="track_ul">
            ${artist['@attr'].rank}. <a href="${artist.url}" target="_blank" class="track_link">${artist.name}</a> with ${artist.playcount} songs played. The artist mbid is ${artist.mbid}.
        </div>
      `).join('');
      dataContainer.innerHTML = html;
  
  })
  .catch(error => console.error(error));
