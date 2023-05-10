const searchForm = document.querySelector('#search-form');
const searchResults = document.querySelector('#search-results');

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

async function performSearch(artistName) {
  searchResults.innerHTML = `<p style="text-align: center">Searching for ${artistName}...</p>`;

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
    const lastfmArtistName = artist.name;

    async function getTopTracks(spotifyArtistID) {
      const topTracksResponse = await fetch(`/.netlify/functions/getSpotifyArtistTopTracks?spotifyArtistID=${spotifyArtistID}`);
      const topTracksData = await topTracksResponse.json();
      return topTracksData.slice(0, 3);
    }

    const topTracks = await getTopTracks(spotifyArtistID);

    // async function getRelatedArtists(spotifyArtistID) {
    //   const relatedArtistsResponse = await fetch(`/.netlify/functions/getSpotifyRelatedArtists?spotifyArtistID=${spotifyArtistID}`);
    //   const relatedArtistsData = await relatedArtistsResponse.json();
    //   return relatedArtistsData.slice(0, 3);
    // }

    // const relatedArtists = await getRelatedArtists(spotifyArtistID);

    async function getLastfmData(lastfmArtistName) {
      const lastfmArtistResponse = await fetch(`/.netlify/functions/getLastfmData?type=getArtistInfo&artist=${encodeURIComponent(lastfmArtistName)}`);
      const lastfmArtistData = await lastfmArtistResponse.json();
      return lastfmArtistData.artist;
    }

    const lastfmArtist = await getLastfmData(lastfmArtistName);
    const lastfmGenres = lastfmArtist.tags.tag
      .filter(tag => tag.name.toLowerCase() !== "seen live")
      .slice(0, 2);
    const lastfmSimilar = lastfmArtist.similar.artist.slice(0, 3);
    let artistBio;
    if (lastfmArtist.bio && lastfmArtist.bio.summary) {
      artistBio = lastfmArtist.bio.content
          .replace(/\n/g, '<br />')
          .replace(/<a href=\"https:\/\/www\.last\.fm\/music\/.*\">Read more on Last\.fm<\/a>\. User-contributed text is available under the Creative Commons By-SA License; additional terms may apply\.$/, '');
    } else {
      artistBio = "unknown";
    }




    async function getLastfmTopAlbums(lastfmArtistName) {
      const lastfmTopAlbumsResponse = await fetch(`/.netlify/functions/getLastfmData?type=topAlbumsByArtist&artist=${encodeURIComponent(lastfmArtistName)}`);
      const lastfmTopAlbumsData = await lastfmTopAlbumsResponse.json();
      return lastfmTopAlbumsData.topalbums;
    }

    const lastfmTopAlbums = await getLastfmTopAlbums(lastfmArtistName);
    const lasftmTopAlbum = lastfmTopAlbums.album.slice(0, 3);

    searchResults.innerHTML = `
      <div class="track_ul2">
      <p style="font-weight: bold; font-size: 22px; text-align: center">${artist.name}</p>
      <div class="image-text-wrapper">
      <img src="${spotifyImgUrl}" alt="${artist.name}" style="max-width: 180px;">
        <div class="no-wrap-text">
          <strong>Genres:</strong> ${
              lastfmGenres && lastfmGenres.length >= 2
              ? `${lastfmGenres[0].name.charAt(0).toUpperCase()}${lastfmGenres[0].name.slice(1)}, ${lastfmGenres[1].name}`
                : "unknown"
          }.
          <br><strong>Similar artists:</strong> ${
              lastfmSimilar && lastfmSimilar.length >= 3
                ? `<a href="/search?artist=${encodeURIComponent(lastfmSimilar[0].name)}">${lastfmSimilar[0].name}</a>, <a href="/search?artist=${encodeURIComponent(lastfmSimilar[1].name)}">${lastfmSimilar[1].name}</a>, and <a href="/search?artist=${encodeURIComponent(lastfmSimilar[2].name)}">${lastfmSimilar[2].name}</a>`
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
        <div id="openai-summary-placeholder" style="margin-bottom: 0px;">
          <p">Generating ChatGPT summary...</p>
        </div>
      </div>
    `;

    const streamingEmbed = `
      <div class="track_ul2">
        Here is ${artist.name}’s most popular song, ${topTracks[0].name}:
        <div style="max-width:600px; margin: 1em auto;">
          <div style="position:relative;padding-bottom:calc(56.25% + 52px);height: 0;">
            <iframe style="position:absolute;top:0;left:0;" width="100%" height="100%" src="https://embed.odesli.co/?url=${topTracks[0].external_urls.spotify}&theme=dark" frameborder="0" allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>
          </div>
        </div><br>
        <h4>More about ${artist.name}:</h4>
        <p>${artistBio}</p>
      </div>
    `;

    searchResults.innerHTML += streamingEmbed;

    const openAiSummaryPlaceholder = document.querySelector('#openai-summary-placeholder');

    const prompt = `Write a summary to help someone decide if they might like the artist ${artist.name}. Include information about the artist’s genres and styles. Write no more than three sentences.`;
    const max_tokens = 120;

    async function getOpenAiSummary(prompt, max_tokens) {
      const OpenAiSummaryResponse = await fetch(`/.netlify/functions/getOpenAI?prompt=${prompt}&max_tokens=${max_tokens}`);
      // const OpenAiSummaryResponse = await fetch(`/.netlify/functions/getOpenAIBonkers?prompt=${prompt}&max_tokens=${max_tokens}`);
      const OpenAiSummaryData = await OpenAiSummaryResponse.json();
      return OpenAiSummaryData.data.choices[0].message['content'];
    }

    const OpenAiSummary = await getOpenAiSummary(prompt, max_tokens);

    openAiSummaryPlaceholder.innerHTML = `
<!--    <p style="text-align: center; color: red;">🚨 <strong><em>ChatGPT is usually super helpful, but just for fun I’m dialling up the sass today...</strong></em> 🚨</p> -->
    <p><strong>Quick summary:</strong><br>
    ${OpenAiSummary}</p>
    `;

  } else {
    searchResults.innerHTML = `<p>No results found</p>`;
  }
}

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // prevent the form from submitting normally
  const artistName = document.querySelector('#artist-name').value;
  performSearch(artistName);
});

const initialArtistName = getQueryParam('artist');
if (initialArtistName) {
  document.querySelector('#artist-name').value = initialArtistName;
  performSearch(initialArtistName);
}

