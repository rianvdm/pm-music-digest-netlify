const searchForm = document.querySelector('#search-form');
const searchResults = document.querySelector('#search-results');

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // prevent the form from submitting normally

  const artistName = document.querySelector('#artist-name').value;

  // Call the Netlify function with the artist name
  const response = await fetch(`/.netlify/functions/getSpotifySearchResults?type=getArtist&q=${encodeURIComponent(artistName)}`);

  if (!response.ok) {
    // Display an error message if the response is not successful
    searchResults.innerHTML = `<p>Error: ${response.statusText}</p>`;
    return;
  }

  // Parse the response JSON
  const jsonResponse = await response.json();

  // Display the search results
  if (jsonResponse.data && jsonResponse.data.items && jsonResponse.data.items.length > 0) {
    const artist = jsonResponse.data.items[0];
    const spotifyUrl = artist.external_urls.spotify;
    const spotifyArtistID = artist.id;
    const spotifyImgUrl = artist.images[1].url;
    const spotifyGenres = artist.genres.slice(0, 3);
    const lastfmArtistName = artist.name

    async function getTopTracks(spotifyArtistID) {
      const topTracksResponse = await fetch(`/.netlify/functions/getSpotifyArtistTopTracks?spotifyArtistID=${spotifyArtistID}`);
      const topTracksData = await topTracksResponse.json();
      return topTracksData.slice(0, 3);
    }

    const topTracks = await getTopTracks(spotifyArtistID);

    async function getRelatedArtists(spotifyArtistID) {
      const relatedArtistsResponse = await fetch(`/.netlify/functions/getSpotifyRelatedArtists?spotifyArtistID=${spotifyArtistID}`);
      const relatedArtistsData = await relatedArtistsResponse.json();
      return relatedArtistsData.slice(0, 3);
    }

    const relatedArtists = await getRelatedArtists(spotifyArtistID);

    async function getLastfmData(lastfmArtistName) {
      const lastfmArtistResponse = await fetch(`/.netlify/functions/getLastfmData?type=getArtistInfo&artist=${lastfmArtistName}`);
      const lastfmArtistData = await lastfmArtistResponse.json();
      return lastfmArtistData.artist;
    }

    const lastfmArtist = await getLastfmData(lastfmArtistName);
    const lastfmGenres = lastfmArtist.tags.tag.slice(0, 2);
    const lastfmSimilar = lastfmArtist.similar.artist.slice(0, 3);


    async function getLastfmTopAlbums(lastfmArtistName) {
      const lastfmTopAlbumsResponse = await fetch(`/.netlify/functions/getLastfmData?type=topAlbumsByArtist&artist=${lastfmArtistName}`);
      const lastfmTopAlbumsData = await lastfmTopAlbumsResponse.json();
      return lastfmTopAlbumsData.topalbums;
    }

    const lastfmTopAlbums = await getLastfmTopAlbums(lastfmArtistName);
    const lasftmTopAlbum = lastfmTopAlbums.album.slice(0, 3);

    searchResults.innerHTML = `
      <div class="track_ul">
      <p style="font-weight: bold; font-size: 22px">${artist.name}</p>
      <div class="image-text-wrapper">
      <img src="${spotifyImgUrl}" alt="${artist.name}" style="max-width: 180px;">
        <div class="no-wrap-text">
          <strong>Genres:</strong> ${
              lastfmGenres && lastfmGenres.length >= 2
                ? `${lastfmGenres[0].name}, ${lastfmGenres[1].name}`
                : "unknown"
          }.
          <br><strong>Similar artists:</strong> ${
              relatedArtists && relatedArtists.length >= 3
                ? `<a href="${relatedArtists[0].external_urls.spotify}">${relatedArtists[0].name}</a>, <a href="${relatedArtists[1].external_urls.spotify}">${relatedArtists[1].name}</a>, and <a href="${relatedArtists[2].external_urls.spotify}">${relatedArtists[2].name}</a>`
                : "unknown"
          }.
          <br><strong>Most popular songs:</strong> ${
              topTracks && topTracks.length >= 3
                ? `<a href="https://odesli.co/${topTracks[0].external_urls.spotify}">${topTracks[0].name}</a>, <a href="https://odesli.co/${topTracks[1].external_urls.spotify}">${topTracks[1].name}</a>, and <a href="https://odesli.co/${topTracks[2].external_urls.spotify}">${topTracks[2].name}</a>`
                : "unknown"
          }.
          <br><strong>Most popular albums:</strong> ${
              lastfmTopAlbums && lastfmTopAlbums.album && lastfmTopAlbums.album.length >= 3
                ? `<a href="${lasftmTopAlbum[0].url}" target="_blank">${lasftmTopAlbum[0].name}</a>, <a href="${lasftmTopAlbum[1].url}" target="_blank">${lasftmTopAlbum[1].name}</a>, and <a href="${lasftmTopAlbum[2].url}" target="_blank">${lasftmTopAlbum[2].name}</a>`
                : "unknown"
          }.
          </div>
        </div>
        <div id="openai-summary-placeholder">
          <p>Generating summary...</p>
        </div>
      </div>
    `;

  const streamingEmbed = `
      <div class="track_recent">
      <p>Here is ${artist.name}‘s most popular song, ${topTracks[0].name}:</p>
      <div style="max-width:600px; margin: 0 auto;">
        <div style="position:relative;padding-bottom:calc(56.25% + 52px);height: 0;">
          <iframe style="position:absolute;top:0;left:0;" width="100%" height="100%" src="https://embed.odesli.co/?url=${topTracks[0].external_urls.spotify}&theme=dark" frameborder="0" allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>
        </div>
      </div>
      </div>
  `;

  searchResults.innerHTML += streamingEmbed;

  const openAiSummaryPlaceholder = document.querySelector('#openai-summary-placeholder');

    const prompt = `Write a summary to help someone decide if they might like the artist ${artist.name}. Include information about the artist’s genres and styles. Write no more than two sentences.`;
    const max_tokens = 100;

    async function getOpenAiSummary(prompt, max_tokens) {
      const OpenAiSummaryResponse = await fetch(`/.netlify/functions/getOpenAI?prompt=${prompt}&max_tokens=${max_tokens}`)
      const OpenAiSummaryData = await OpenAiSummaryResponse.json();
      return OpenAiSummaryData.data.choices[0].message['content']
    }

    const OpenAiSummary = await getOpenAiSummary(prompt, max_tokens);

    openAiSummaryPlaceholder.innerHTML = `<p>${OpenAiSummary}</p>`;

  } else {
    searchResults.innerHTML = `<p>No results found</p>`;
  }
});
