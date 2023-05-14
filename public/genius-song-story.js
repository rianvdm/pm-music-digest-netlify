async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

function removeUnwantedText(text) {
  // Regular expression pattern to match text within brackets
  const roundBracketRegex = /\([^()]*\)/g;
  const squareBracketRegex = /\[[^\]]*\]/g;
  
  let result = text.replace(roundBracketRegex, '');
  result = result.replace(squareBracketRegex, '');
  
  // Regular expression pattern to match "remaster" or "remastered", case-insensitive
  const remasterRegex = /\b(remaster|remastered)\b/gi;
  
  result = result.replace(remasterRegex, '');
  
  return result.trim(); // Trim any leading or trailing spaces
}

async function fetchAndDisplayTrack() {
  try {
    const dataContainer = document.querySelector('.js-genius-song-story');
    const recentTracksData = await fetchData('/.netlify/functions/getRecentTracks?limit=1');
    const nowPlaying = [recentTracksData.recenttracks.track[0]];

    const artist = nowPlaying[0].artist['#text'];
    const title = removeUnwantedText(nowPlaying[0].name);
    const album = nowPlaying[0].album['#text'];
    const query = `${sanitizeInput(title)} ${sanitizeInput(artist)}`;

    const geniusData = await fetchData(`/.netlify/functions/getGeniusSearch?query=${query}`);

    if(!geniusData.data.response.hits[0] || !geniusData.data.response.hits[0].result.id) {
        displayErrorMessage('.js-genius-song-story', 'No Genius ID found for the song. Please try another song!');
        return; // Stop executing the function
    }

    const geniusID = geniusData.data.response.hits[0].result.id;

    const geniusSong = await fetchData(`/.netlify/functions/getGeniusSong?songid=${geniusID}`);
//    const geniusStory = geniusSong.data.response.song.description.dom;
    const geniusSongPath = geniusSong.data.response.song.path;
    const geniusSongName = geniusSong.data.response.song.full_title;

    let geniusStory = geniusSong.data.response.song.description.dom;
    if (geniusStory.children[0].children[0] === "?") {
      geniusStory = "Computer says no.";
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

    return childrenHTML;
}

let descriptionHTML = generateHTML(geniusStory);

if (geniusStory !== "Computer says no.") {
  const additionalHTML = `
  <p>ℹ️ <em>This data about the song comes from <a href="https://genius.com${geniusSongPath}">Genius</a>.
  Genius thinks this song is <strong>${geniusSongName}</strong>.</em></p>
  `;
  descriptionHTML = additionalHTML + descriptionHTML;
} else {
  descriptionHTML = "Computer says no.";
}

    const html = `
      <div class="track_recent">
      <p>${descriptionHTML}</p>
      </div>
    `;
    dataContainer.innerHTML = html;
  } catch (error) {
    console.error(error);
    displayErrorMessage('js-genius-song-story', 'Oops, it looks like the Genius API is having some issues. Please try again a little later!');
  }
}

function sanitizeInput(input) {
  return encodeURIComponent(input.replace(/[+&™]/g, ''));
}

function displayErrorMessage(selector, message) {
  const container = document.querySelector(selector);
  const html = `
    <p class="track_recent" style="text-align: center;"><strong>${message}</strong></p>
  `;
  container.innerHTML = html;
}

fetchAndDisplayTrack();

