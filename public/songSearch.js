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

function sanitizeInput(input) {
  return encodeURIComponent(input.replace(/[+&™]/g, ''));
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


async function performSearch(songName) {
  searchResults.innerHTML = `<p style="text-align: center">Searching for ${songName}...</p>`;

  // Call the Netlify function with the song name
  const response = await fetch(`/.netlify/functions/getSpotifySearchResults?type=getTrack&q=${encodeURIComponent(songName)}`);

  if (!response.ok) {
    // Display an error message if the response is not successful
    searchResults.innerHTML = `<p>Error: ${response.statusText}</p>`;
    return;
  }

  // Parse the response JSON
  const jsonResponse = await response.json();

  // Display the search results
  if (jsonResponse.data && jsonResponse.data.items && jsonResponse.data.items.length > 0) {
    const track = jsonResponse.data.items[0];
    const spotifyUrl = track.external_urls.spotify;
    const spotifyTrackID = track.id;
    const spotifyImgUrl = track.album.images[1].url;
    const spotifysongName = track.name;
    const cleansongName = removeUnwantedText(spotifysongName);
    const spotifyArtistName = track.artists[0].name;
    const spotifyArtistID = track.artists[0].id;
    const spotifyAlbumName = track.album.name;
    const spotifyReleased = track.album.release_date;
    const spotifyYear = spotifyReleased.length === 4 ? spotifyReleased : spotifyReleased.substring(0, 4);

    // Recommended songs


    async function getSpotifyArtist(spotifyArtistName) {
      const spotifyArtistData = await fetchData('getSpotifySearchResults', {type: 'getArtist', q: spotifyArtistName});
      return spotifyArtistData.data.items[0];  
    }

    const spotifyArtist = await getSpotifyArtist(spotifyArtistName);

    const spotifyGenreList = spotifyArtist.genres.slice(0, 2);

    const spotifyGenres = `${spotifyGenreList[0]},${spotifyGenreList[1]}`;

    async function getSpotifyReco(spotifyArtistID, spotifyGenres, spotifyTrackID) {
      const spotifyRecoData = await fetchData('getSpotifyRecommendations', {seed_artists: spotifyArtistID, seed_genres: spotifyGenreList, seed_tracks: spotifyTrackID});
      return spotifyRecoData.tracks; 
    }

    const spotifyReco = await getSpotifyReco(spotifyArtistID, spotifyGenres, spotifyTrackID); 

    const spotifyTrackReco = spotifyReco.slice(0, 3).map(track => track.name);
    const spotifyArtistReco = spotifyReco.slice(0, 3).map(track => track.artists[0].name);
    const spotifyUrlsReco = spotifyReco.slice(0, 3).map(track => track.external_urls.spotify);
    const spotifyRecoID = spotifyReco.slice(0, 2).map(track => track.id);


    // Genius search

    const query = `${sanitizeInput(cleansongName)} ${sanitizeInput(spotifyArtistName)}`;

    async function getGeniusData(query) {
      const geniusDataResponse = await fetchData('getGeniusSearch', {query: query});
      return geniusDataResponse;
    }

    // Wrap Genius API call and associated operations with try-catch
    let geniusData, geniusID, geniusSong, geniusSongPath, geniusSongName, geniusStory, descriptionHTML = "";

    try {
      geniusData = await getGeniusData(query);

      if(!geniusData.data.response.hits[0] || !geniusData.data.response.hits[0].result.id) {
        throw new Error("No Genius ID found for the song");
      }

      geniusID = geniusData.data.response.hits[0].result.id;
      const geniusSongResponse = await fetch(`/.netlify/functions/getGeniusSong?songid=${geniusID}`);
      geniusSong = await geniusSongResponse.json();
      geniusSongPath = geniusSong.data.response.song.path;
      geniusSongName = geniusSong.data.response.song.full_title;

      geniusStory = geniusSong.data.response.song.description.dom;
      if (geniusStory.children[0].children[0] === "?") {
        geniusStory = "Genius has nothing to add.";
      }

      descriptionHTML = generateHTML(geniusStory);

      if (geniusStory !== "Genius has nothing to add.") {
        const additionalHTML = `
        <strong>Song summary:</strong>
        <p>ℹ️ <em><a href="https://genius.com${geniusSongPath}">Genius</a> thinks this song is <strong>${geniusSongName}</strong>. The search isn’t great so that might not be accurate.</em></p>
        `;
        descriptionHTML = additionalHTML + descriptionHTML;
      } else {
        descriptionHTML = "Genius has nothing to add.";
      }
    } catch(err) {
      console.error(err);
      descriptionHTML = "<p>Sorry, no additional information is available for this song.</p>";
    }


function generateHTML(node) {
    if (typeof node === 'string') {
        return node;
    }

    let childrenHTML = '';
    if (node.children) {
        childrenHTML = node.children.map(generateHTML).join('');
    }

    if (node.tag === 'a') {
        return `<a href="${node.attributes.href}" rel="${node.attributes.rel || ''}">${childrenHTML}</a>`;
    }

    if (node.tag === 'p' || node.tag === 'em') {
        return `<${node.tag}>${childrenHTML}</${node.tag}>`;
    }
    
    if (node.tag === 'img') {
        return `<img src="${node.attributes.src}" alt="${node.attributes.alt || ''}" style="max-width: 600px; display: block; margin: auto;">`;
    }

    return childrenHTML;
}


    searchResults.innerHTML = `
      <p style="font-weight: bold; font-size: 22px; text-align: center">${spotifysongName} by <a href="/search?artist=${spotifyArtistName}">${spotifyArtistName}</a></p>
      <div class="track_ul2">
        <div style="max-width:500px; margin: 1em auto;">
          <div style="position:relative;padding-bottom:calc(56.25% + 52px);height: 0;">
            <iframe style="position:absolute;top:0;left:0;" width="100%" height="100%" src="https://embed.odesli.co/?url=${spotifyUrl}&theme=dark" frameborder="0" allowfullscreen sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>
          </div>
            </div><br>
        <div class="no-wrap-text">
          <p>${spotifysongName} by ${spotifyArtistName} is a ${spotifyGenreList[0]} song from the album <a href="/search-album?album=${spotifyAlbumName}%20${spotifyArtistName}">${spotifyAlbumName}</a>, released in ${spotifyYear}. Here are some recommended tracks if you like that one:</p>
          <div id="copy-success-message"></div>
          <p style="text-align:center;"><button id="copy-link">Copy Page Link</button></p>
          <p><iframe class="spotify-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/${spotifyRecoID[0]}"
              width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy">
          </iframe></p>
          <p><iframe class="spotify-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/${spotifyRecoID[1]}"
              width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy">
          </iframe></p>
          <p>${descriptionHTML}</p>
        </div>
      </div>
      
    `;

    const copyLinkButton = document.querySelector('#copy-link');

    copyLinkButton.addEventListener('click', () => {
      const albumName = document.querySelector('#song-name').value;
      const searchUrl = `${window.location.origin}${window.location.pathname}?song=${encodeURIComponent(spotifysongName)}%20${encodeURIComponent(spotifyArtistName)}`;
      copyToClipboard(searchUrl);
    });


  } else {
    searchResults.innerHTML = `<p>No results found</p>`;
  }
}

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // prevent the form from submitting normally
  const songName = document.querySelector('#song-name').value;
  performSearch(songName);
});

const initialsongName = getQueryParam('song');
if (initialsongName) {
  document.querySelector('#song-name').value = initialsongName;
  performSearch(initialsongName);
}

function copyToClipboard(text) {
  const copySuccessMessage = document.querySelector('#copy-success-message');
  const copyLinkButton = document.querySelector('#copy-link');
  
  navigator.clipboard.writeText(text).then(() => {
    console.log('Copying to clipboard was successful!');
    copySuccessMessage.innerHTML = '<p style="text-align:center">Link copied successfully!</p>';
    copyLinkButton.style.display = 'none';
  }, (err) => {
    console.error('Could not copy text: ', err);
    copySuccessMessage.innerHTML = 'Error: Could not copy link. Please try again.';
  });
}
