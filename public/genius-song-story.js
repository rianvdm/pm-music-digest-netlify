async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
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
      geniusStory = "Genius has nothing to add.";
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


let descriptionHTML = generateHTML(geniusStory);

if (geniusStory !== "Genius has nothing to add.") {
  const additionalHTML = `
  <p>ℹ️ <em><a href="https://genius.com${geniusSongPath}">Genius</a> thinks this song is <strong>${geniusSongName}</strong>. The search isn’t great so that might not be accurate.</em></p>
  `;
  descriptionHTML = additionalHTML + descriptionHTML;
} else {
  descriptionHTML = "Genius has nothing to add.";
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

