fetch(`/.netlify/functions/getRecentTracks`)
  .then(response => response.json())
  .then(data => {
  //  const dataContainer = document.querySelector('.js-openai-summary');
    const nowPlaying = [data.recenttracks.track[0]]; 

// Get the data for the artist
const artistName = nowPlaying[0].artist['#text']
  .replace(/&/g, '%26')
  .replace(/\+/g, '%2B');
const encodedArtist = encodeURIComponent(artistName);
const trackName = nowPlaying[0].name
  .replace(/&/g, '%26')
  .replace(/\+/g, '%2B');
const encodedName = encodeURIComponent(trackName);


// Call OpenAI to generate a summary
// const prompt = `Write a summary of the artist ${encodedName}. The summary should be 2 sentences long and include the artist's main genres.`;
const prompt = `Write a summary to help someone decide if they might like the song ${encodedName} by ${encodedArtist}. Include information about the song/artist’s genres as well as similar artists. Write no more than two sentences.`;
const max_tokens = 100;

fetch(`/.netlify/functions/getOpenAI?prompt=${prompt}&max_tokens=${max_tokens}`)

  .then(response => response.json())
  .then(data => {
    // Check if artist exists on Last.fm. If it doesn't, don't show artist details.
      const dataContainer = document.querySelector('.js-openai-summary');
      const summary = data.data.choices[0].message['content'];
      const html = `
        <div class="track_none">
          <p style="text-align: center;">
          ${summary}
          </p>
        </div>
      `;
      dataContainer.innerHTML = html;
      })

    })