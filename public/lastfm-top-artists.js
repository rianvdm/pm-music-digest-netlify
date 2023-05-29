const fetchTopArtistsJSON = async (url, errorMessage = 'Request failed') => {
  const response = await fetch(url);
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.message || errorMessage);
  }
  return response.json();
};

const handleTopArtistsError = (error, container) => {
  console.error(error);
  container.innerHTML += `<p>Error: ${error.message}</p>`;
};

const fetchArtistData = async (artist) => {
  try {
    const q = `${artist.name}`;

    const spotifyData = await fetchTopArtistsJSON(`/.netlify/functions/getSpotifySearchResults?type=getArtist&q=${encodeURIComponent(q)}`);
    const spotifyArtistID = spotifyData.data.items[0].id;
    const spotifyArtistImgUrl = spotifyData.data.items[0].images[1].url;
    const spotifyGenres = spotifyData.data.items[0].genres.slice(0, 3);

    const [topTracks, relatedArtists] = await Promise.all([
      fetchTopArtistsJSON(`/.netlify/functions/getSpotifyArtistTopTracks?spotifyArtistID=${spotifyArtistID}`).then(data => data.slice(0, 3)),
      fetchTopArtistsJSON(`/.netlify/functions/getSpotifyRelatedArtists?spotifyArtistID=${spotifyArtistID}`).then(data => data.slice(0, 3))
    ]);

    return { artist, spotifyArtistImgUrl, spotifyGenres, topTracks, relatedArtists };

  } catch (error) {
    handleTopArtistsError(error, document.querySelector('.js-lastfm-top-artists'));
  }
};

document.querySelector('.js-lastfm-top-artists').innerHTML = `<p style="text-align: center;">Loading...</p>`;

fetchTopArtistsJSON('/.netlify/functions/getTopArtists?period=7day&limit=5')
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-top-artists');
    const topArtists = data.topartists.artist.slice(0, 5);

    const artistData = await Promise.all(topArtists.map(fetchArtistData));

    const htmlStrings = artistData.map(({artist, spotifyArtistImgUrl, spotifyGenres, topTracks, relatedArtists}) => {
      return `
        <div class="track_ul">
          <img src="${spotifyArtistImgUrl}">
          <div class="no-wrap-text">
            <strong><a href="/search?artist=${artist.name}">${artist.name}</a></strong> (${artist.playcount} plays).
            <br><strong>Genres:</strong> ${
                spotifyGenres && spotifyGenres.length >= 1
                  ? `${spotifyGenres[0]}, ${spotifyGenres[1]}`
                  : "unknown"
            }.
            <br><strong>Most popular songs:</strong> ${
                topTracks && topTracks.length >= 3
                  ? `<a href="/search-song?song=${topTracks[0].name}%20${artist.name}">${topTracks[0].name}</a>, <a href="/search-song?song=${topTracks[1].name}%20${artist.name}">${topTracks[1].name}</a>, and <a href="/search-song?song=${topTracks[2].name}%20${artist.name}">${topTracks[2].name}</a>`
                  : "unknown"
            }.
            <br><strong>Similar artists:</strong> ${
                relatedArtists && relatedArtists.length >= 3
                  ? `<a href="/search?artist=${relatedArtists[0].name}">${relatedArtists[0].name}</a>, <a href="/search?artist=${relatedArtists[1].name}">${relatedArtists[1].name}</a>, and <a href="/search?artist=${relatedArtists[2].name}">${relatedArtists[2].name}</a>`
                  : "unknown"
            }.
          </div>
        </div>
      `;
    });

    dataContainer.innerHTML = htmlStrings.join('');
  })
  .catch(error => handleTopArtistsError(error, document.querySelector('.js-lastfm-top-artists')));
