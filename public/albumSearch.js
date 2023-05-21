const searchForm = document.querySelector('#search-form');
const searchResults = document.querySelector('#search-results');

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function removeUnwantedText(text) {
  const roundBracketRegex = /\([^()]*\)/g;
  const squareBracketRegex = /\[[^\]]*\]/g;
  const remasterRegex = /\b(remaster|remastered)\b/gi;
  const hyphenRegex = /\s-\s.*/g;

  let result = text.replace(roundBracketRegex, '');
  result = result.replace(squareBracketRegex, '');
  result = result.replace(remasterRegex, '');
  result = result.replace(hyphenRegex, '');
  
  return result.trim(); // Trim any leading or trailing spaces
}

async function fetchData(endpoint, params = {}) {
  const urlParams = new URLSearchParams(params).toString();
  const url = `/.netlify/functions/${endpoint}?${urlParams}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
  }
  return response.json();
}


async function performSearch(albumName) {
  searchResults.innerHTML = `<p style="text-align: center">Searching for ${albumName}...</p>`;

  // Call the Netlify function with the artist name
  const response = await fetch(`/.netlify/functions/getSpotifySearchResults?type=getAlbum&q=${encodeURIComponent(albumName)}`);

  if (!response.ok) {
    // Display an error message if the response is not successful
    searchResults.innerHTML = `<p>Error: ${response.statusText}</p>`;
    return;
  }

  // Parse the response JSON
  const jsonResponse = await response.json();

  // Display the search results
  if (jsonResponse.data && jsonResponse.data.items && jsonResponse.data.items.length > 0) {
    const album = jsonResponse.data.items[0];
    const spotifyUrl = album.external_urls.spotify;
    const spotifyAlbumID = album.id;
    const spotifyImgUrl = album.images[1].url;
    const spotifyAlbumName = album.name;
    const cleanAlbumName = removeUnwantedText(spotifyAlbumName);
    const spotifyArtistName = album.artists[0].name;
    const spotifyReleased = album.release_date;
    const spotifyYear = spotifyReleased.length === 4 ? spotifyReleased : spotifyReleased.substring(0, 4);
    const spotifyTotalTracks = album.total_tracks;
    const fullAlbumName = `${cleanAlbumName} ${spotifyArtistName}`;

    async function getLastfmAlbumInfo(spotifyAlbumName) {
      const lastfmAlbumData = await fetchData('getLastfmAlbumInfo', {artist: spotifyArtistName, album: cleanAlbumName, limit: 1})
      return lastfmAlbumData.album;
    }

    const lastfmAlbum = await getLastfmAlbumInfo(spotifyAlbumName);
    let lastfmGenres
    if (lastfmAlbum.tags && lastfmAlbum.tags.tag.length >= 3) {
     lastfmGenres = lastfmAlbum.tags.tag
       .filter(tag => tag.name.toLowerCase() !== "seen live")
       .slice(0, 3);
    } else {
      lastfmGenres = "unknown";
    }
    let lastfmWiki;
    if (lastfmAlbum.wiki && lastfmAlbum.wiki.content) {
        lastfmWiki = lastfmAlbum.wiki.content
            .replace(/\n/g, '<br />')
            .replace(/<a href="https:\/\/www\.last\.fm\/music\/.*">Read more on Last\.fm<\/a>\. User-contributed text is available under the Creative Commons By-SA License; additional terms may apply\./, '');
    } else {
        lastfmWiki = "Last.fm unfortunately doesn’t have any additional information about this album.";
    }

    // async function getLastfmTopAlbums(spotifyalbumName) {
    //   const lastfmTopAlbumsData = await fetchData('getLastfmData', {type: 'topAlbumsByArtist', artist: encodeURIComponent(spotifyalbumName)});
    //   return lastfmTopAlbumsData.topalbums;
    // }

    // const lastfmTopAlbums = await getLastfmTopAlbums(spotifyalbumName);
    // const lasftmTopAlbum = lastfmTopAlbums.album.slice(0, 3);


    searchResults.innerHTML = `
      <p style="font-weight: bold; font-size: 22px; text-align: center">${spotifyAlbumName} by <a href="/search?artist=${spotifyArtistName}">${spotifyArtistName}</a></p>
      <div class="track_ul2">
      <div style="max-width:500px; margin: 1em auto;">
        <div style="position:relative;padding-bottom:calc(56.25% + 52px);height: 0;">
          <iframe style="position:absolute;top:0;left:0;" width="100%" height="100%" src="https://embed.odesli.co/?url=${spotifyUrl}&theme=dark" frameborder="0" allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>
        </div>
      </div><br>
      <p><em>
      ${
        Array.isArray(lastfmGenres) && lastfmGenres.length >= 1
          ? lastfmGenres.length === 1
            ? "unknown"
            : `${lastfmGenres[0].name.charAt(0).toUpperCase()}${lastfmGenres[0].name.slice(1)}, ${lastfmGenres[1].name.toLowerCase()}, ${lastfmGenres[2].name.toLowerCase()}`
          : "Unknown genre"
      }
      album with ${spotifyTotalTracks} tracks. Released in ${spotifyYear}.
      </em></p>
      <div id="openai-summary-placeholder" style="margin-bottom: 0px;">
        <p><em>Generating ChatGPT summary...</em></p>
      </div>

        
      </div>
    `;

    const wikiEmbed = `
      <p><strong>More information about ${cleanAlbumName} from Last.fm:</strong></p>
      <p>${lastfmWiki}</p>
    `;

    searchResults.innerHTML += wikiEmbed;


    const openAiSummaryPlaceholder = document.querySelector('#openai-summary-placeholder');


    // Start OpenAI call
      const prompt = `Write a summary to help someone decide if they might like the album ${cleanAlbumName} by ${spotifyArtistName}. Include information about the album's genres and styles. Write no more than three sentences.`;
      const max_tokens = 120;

      async function getOpenAiSummary(prompt, max_tokens) {
        const OpenAiSummaryData = await fetchData('getOpenAIAlbum', {prompt: prompt, max_tokens: max_tokens, name: fullAlbumName});
        return OpenAiSummaryData.data;
      }


      getOpenAiSummary(prompt, max_tokens)
        .then(OpenAiSummary => {
          openAiSummaryPlaceholder.innerHTML = `<p><strong>Album summary from ChatGPT:</strong></p>
          <p>${OpenAiSummary}</p>`;
        })
        .catch(error => {
          openAiSummaryPlaceholder.innerHTML = `<p>Error: ${error.message}. Unable to fetch summary from OpenAI.</p>`;
        });


  } else {
    searchResults.innerHTML = `<p>No results found</p>`;
  }
}

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // prevent the form from submitting normally
  const albumName = document.querySelector('#album-name').value;
  performSearch(albumName);
});

const initialalbumName = getQueryParam('album');
if (initialalbumName) {
  document.querySelector('#album-name').value = initialalbumName;
  performSearch(initialalbumName);
}

