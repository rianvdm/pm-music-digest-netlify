const searchForm = document.querySelector('#search-form');
const searchResults = document.querySelector('#search-results');

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
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
    const spotifyArtistName = artist.name;

    async function getTopTracks(spotifyArtistID) {
      const topTracksData = await fetchData('getSpotifyArtistTopTracks', {spotifyArtistID: spotifyArtistID});
      return topTracksData.slice(0, 3);
    }

    const topTracks = await getTopTracks(spotifyArtistID);

    // async function getRelatedArtists(spotifyArtistID) {
    //   const relatedArtistsResponse = await fetch(`/.netlify/functions/getSpotifyRelatedArtists?spotifyArtistID=${spotifyArtistID}`);
    //   const relatedArtistsData = await relatedArtistsResponse.json();
    //   return relatedArtistsData.slice(0, 3);
    // }

    // const relatedArtists = await getRelatedArtists(spotifyArtistID);

    async function getLastfmData(spotifyArtistName) {
      const lastfmArtistData = await fetchData('getLastfmData', {type: 'getArtistInfo', artist: encodeURIComponent(spotifyArtistName)});
      return lastfmArtistData.artist;
    }

    const lastfmArtist = await getLastfmData(spotifyArtistName);
    const lastfmGenres = lastfmArtist.tags.tag
      .filter(tag => tag.name.toLowerCase() !== "seen live")
      .slice(0, 3);
    const lastfmSimilar = lastfmArtist.similar.artist.slice(0, 3);
    let artistBio;
    if (lastfmArtist.bio && lastfmArtist.bio.content) {
        artistBio = lastfmArtist.bio.content
            .replace(/\n/g, '<br />')
            .replace(/<a href="https:\/\/www\.last\.fm\/music\/.*">Read more on Last\.fm<\/a>\. User-contributed text is available under the Creative Commons By-SA License; additional terms may apply\./, '');
    } else {
        artistBio = "Last.fm unfortunately doesn’t have any additional information about this artist.";
    }


    async function getLastfmTopAlbums(spotifyArtistName) {
      const lastfmTopAlbumsData = await fetchData('getLastfmData', {type: 'topAlbumsByArtist', artist: encodeURIComponent(spotifyArtistName)});
      return lastfmTopAlbumsData.topalbums;
    }

    const lastfmTopAlbums = await getLastfmTopAlbums(spotifyArtistName);
    const lasftmTopAlbum = lastfmTopAlbums.album.slice(0, 3);


    searchResults.innerHTML = `
      <div class="track_ul2">
      <p style="font-weight: bold; font-size: 22px; text-align: center">${artist.name}</p>
      <div class="image-text-wrapper">
      <img src="${spotifyImgUrl}" alt="${artist.name}" style="max-width: 220px;">
        <div class="no-wrap-text">
          <strong>Genres:</strong> ${
              lastfmGenres && lastfmGenres.length >= 2
              ? `${lastfmGenres[0].name.charAt(0).toUpperCase()}${lastfmGenres[0].name.slice(1)}, ${lastfmGenres[1].name.toLowerCase()}, ${lastfmGenres[2].name.toLowerCase()}`
                : "unknown"
          }.
          <br><strong>Similar artists:</strong> ${
              lastfmSimilar && lastfmSimilar.length >= 2
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
          <p><em>Generating ChatGPT summary...</em></p>
        </div>
      </div>
    `;

    const streamingEmbed = `
      <div class="track_ul2">
        Here is ${artist.name}’s most popular song, ${topTracks[0].name}:
        <div style="max-width:500px; margin: 1em auto;">
          <div style="position:relative;padding-bottom:calc(56.25% + 52px);height: 0;">
            <iframe style="position:absolute;top:0;left:0;" width="100%" height="100%" src="https://embed.odesli.co/?url=${topTracks[0].external_urls.spotify}&theme=dark" frameborder="0" allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>
          </div>
        </div><br>
        <!-- <h4>More about ${topTracks[0].name}:</h4>
         <div id="description-placeholder">
           <p>Fetching information about the song...</p>
         </div> -->
        <h4>More about ${artist.name} (via Last.fm):</h4>
        <p>${artistBio}</p>
      </div>
    `;

    searchResults.innerHTML += streamingEmbed;

    // const descriptionPlaceholder = document.querySelector('#description-placeholder');
    // const artistBioPlaceholder = document.querySelector('#artist-bio-placeholder');
    const openAiSummaryPlaceholder = document.querySelector('#openai-summary-placeholder');

    // // Start Genius API calls

    //   function removeTextInBrackets(text) {
    //     // Regular expression pattern to match text within brackets
    //     const regex = /\([^()]*\)/g;
        
    //     // Replace the matched text with an empty string
    //     const result = text.replace(regex, '');
        
    //     return result.trim(); // Trim any leading or trailing spaces
    //   }

    // const query = `${removeTextInBrackets(topTracks[0].name)} ${artist.name}`;
    // const query = `${artist.name}`;
    // const geniusDataPromise = fetchData('getGeniusSearch', {query: query});
    // const geniusSongPromise = geniusDataPromise
    //  .then(geniusData => fetchData('getGeniusSong', {songid: geniusData.data.response.hits[0].result.id}));
    // const geniusArtistPromise = geniusDataPromise
    //   .then(geniusData => fetchData('getGeniusArtist', {artistid: geniusData.data.response.hits[0].result.primary_artist.id}));


    // Start OpenAI call
      const prompt = `Write a summary to help someone decide if they might like the artist ${artist.name}. Include information about the artist’s genres and styles. Write no more than three sentences.`;
      const max_tokens = 120;

      async function getOpenAiSummary(prompt, max_tokens) {
        const OpenAiSummaryData = await fetchData('getOpenAI', {prompt: prompt, max_tokens: max_tokens});
        return OpenAiSummaryData.data.choices[0].message['content'];
      }

      getOpenAiSummary(prompt, max_tokens)
        .then(OpenAiSummary => {
          openAiSummaryPlaceholder.innerHTML = `<p>${OpenAiSummary}</p>`;
        })
        .catch(error => {
          openAiSummaryPlaceholder.innerHTML = `<p>Error: ${error.message}. Unable to fetch summary from OpenAI.</p>`;
        });


    // function generateHTML(node) {
    //     if (typeof node === 'string') {
    //         return node;
    //     }

    //     let childrenHTML = '';
    //     if (node.children) {
    //         childrenHTML = node.children.map(generateHTML).join('');
    //     }

    //     if (node.tag === 'a') {
    //         return `<a href="${node.attributes.href}" rel="${node.attributes.rel || ''}">${childrenHTML}</a>`;
    //     }

    //     if (node.tag === 'p' || node.tag === 'em') {
    //         return `<${node.tag}>${childrenHTML}</${node.tag}>`;
    //     }

    //     return childrenHTML;
    // }

    // Handle Genius API call results as soon as they're ready
    // geniusSongPromise.then(geniusSong => {
    //   let geniusStory = geniusSong.data.response.song.description.dom;
    //   if (geniusStory.children[0].children[0] === "?") {
    //     geniusStory = "No additional information available.";
    //   }
    //   const descriptionHTML = generateHTML(geniusStory);
    //   descriptionPlaceholder.innerHTML = `<p>${descriptionHTML}</p>`;
    // });

    // geniusArtistPromise.then(geniusArtist => {
    //   let geniusArtistBio = geniusArtist.data.response.artist.description.dom;
    //   if (geniusArtistBio.children[0].children[0] === "?") {
    //     geniusArtistBio = "No additional information available.";
    //   }
    //   const geniusArtistBioHTML = generateHTML(geniusArtistBio);
    //   artistBioPlaceholder.innerHTML = `<p>${geniusArtistBioHTML}</p>`;
    // });


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

