
const prompt = `Write a summary to help someone decide if they might like the artist Enya. Include information about the artist’s genres and style. Write no more than two sentences.`;
const max_tokens = 100;

fetch(`/.netlify/functions/getOpenAI?prompt=${prompt}&max_tokens=${max_tokens}`)

  .then(response => response.json())
  .then(data => {
    // Check if artist exists on Last.fm. If it doesn't, don't show artist details.
      const dataContainer = document.querySelector('.js-openai-artist-summary');
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
