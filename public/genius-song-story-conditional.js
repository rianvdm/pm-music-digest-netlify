let descriptionHTMLGlobal = ""; // global variable to store the descriptionHTML

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

// new function to render the description
function renderDescription() {
  const descriptionContainer = document.querySelector('.description-container');
  const html = `
    <div class="track_recent">
      <p>${descriptionHTMLGlobal}</p>
    </div>
  `;
  descriptionContainer.innerHTML = html;
  descriptionContainer.style.display = 'block'; // show the description-container
}

async function fetchAndDisplayTrack() {
  try {
    let meaningfulData = false;
    const dataContainer = document.querySelector('.js-genius-song-story');
    const recentTracksData = await fetchData('/getRecentTracks?limit=1');
    const nowPlaying = [recentTracksData.recenttracks.track[0]];

    const artist = nowPlaying[0].artist['#text'];
    const title = removeUnwantedText(nowPlaying[0].name);
    const album = nowPlaying[0].album['#text'];
    const query = `${sanitizeInput(title)} ${sanitizeInput(artist)}`;

    const geniusData = await fetchData(`/.netlify/functions/getGeniusSearch?query=${query}`);

    if(!geniusData.data.response.hits[0] || !geniusData.data.response.hits[0].result.id) {
        // displayErrorMessage('.js-genius-song-story', 'No Genius ID found for the song. Please try another song!');
        return; // Stop executing the function
    }

    const geniusID = geniusData.data.response.hits[0].result.id;

    const geniusSong = await fetchData(`/.netlify/functions/getGeniusSong?songid=${geniusID}`);
    const geniusSongPath = geniusSong.data.response.song.path;
    const geniusSongName = geniusSong.data.response.song.full_title;

    let geniusStory = geniusSong.data.response.song.description.dom;
    if (geniusStory.children[0].children[0] === "?") {
      geniusStory = "Computer says no.";
    } else {
      meaningfulData = true; // If the data is meaningful, set the flag to true
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

    if (geniusStory !== "Computer says no.") {
      const additionalHTML = `
      <p>ℹ️ <em><a href="https://genius.com${geniusSongPath}">Genius</a> thinks this song is <strong>${geniusSongName}</strong>. The search isn’t great so that might not be accurate.</em></p>
      `;
      descriptionHTML = additionalHTML + descriptionHTML;
    } else {
      descriptionHTML = "Computer says no.";
    }

    descriptionHTMLGlobal = descriptionHTML; // assign the descriptionHTML to global variable

    if (meaningfulData) {
      const button = document.createElement('button');
      button.innerText = 'More info about this song';
      button.className = 'button';
      button.onclick = function() {
        this.style.display = 'none'; // hide the button when clicked
        renderDescription(); // call the function to render the description when the button is clicked
      };
      dataContainer.appendChild(button); // append the button to the dataContainer
    }

  } catch (error) {
    console.error(error);
    displayErrorMessage('.js-genius-song-story', 'Oops, it looks like the Genius API is having some issues. Please try again a little later!');
  }
}

fetchAndDisplayTrack();
