async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

function removeTextInBrackets(text) {
  // Regular expression pattern to match text within brackets
  const regex = /\([^()]*\)/g;
  
  // Replace the matched text with an empty string
  const result = text.replace(regex, '');
  
  return result.trim(); // Trim any leading or trailing spaces
}

async function fetchAndDisplayTrack() {
  try {
    const dataContainer = document.querySelector('.js-genius-song-story');
    const recentTracksData = await fetchData('/.netlify/functions/getRecentTracks?limit=1');
    const nowPlaying = [recentTracksData.recenttracks.track[0]];

    const artist = nowPlaying[0].artist['#text'];
    const title = nowPlaying[0].name;
    const album = nowPlaying[0].album['#text'];
    const query = `${sanitizeInput(title)} by ${sanitizeInput(artist)}`;

    const geniusData = await fetchData(`/.netlify/functions/getGeniusSearch?query=${query}`);
    const geniusID = geniusData.data.response.hits[0].result.id;

    const geniusSong = await fetchData(`/.netlify/functions/getGeniusSong?songid=${geniusID}`);
//    const geniusStory = geniusSong.data.response.song.description.dom;
    const geniusSongPath = geniusSong.data.response.song.path;

    let geniusStory = geniusSong.data.response.song.description.dom;
    if (geniusStory.children[0].children[0] === "?") {
      geniusStory = "";
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

const descriptionHTML = generateHTML(geniusStory);

    const html = `
      <div class="track_recent">
      <p>${descriptionHTML}</p>
      <p>ℹ️ <em>This data about the song comes from <a href="https://genius.com/${geniusSongPath}">Genius</a>, and it can be a little weird sometimes. But sometimes it’s interesting!</em></p>
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
