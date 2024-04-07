fetch('/getSpotifyTopItems?type=artists')
  .then(response => response.json())
  .then(async data => {
    const dataContainer = document.querySelector('.js-spotify-top-artists');
    const topSpotifyArtists = data.items.slice(0, 5);

    const trackPromises = topSpotifyArtists.map(async item => {
      const genres = item.genres.slice(0, 3);
      let genreText;

      if (genres.length === 0) {
        genreText = "unknown";
      } else {
        genreText = genres.join(', ');
      }

      return `
        <div">
          <p><a href="${item.external_urls.spotify}" target="_blank">${item.name}</a> (${genreText}).</p>
        </div>
      `;
    });
    const html = await Promise.all(trackPromises);
    dataContainer.innerHTML = html.join('');
  })
  .catch(error => {
    const dataContainer = document.querySelector('.js-spotify-top-tracks');
    dataContainer.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
    console.error(error);
  });
