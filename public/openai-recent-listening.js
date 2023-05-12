fetch('/.netlify/functions/getRecentTracks?limit=10')
  .then(response => response.json())
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-recent');
    const recentTracks = data.recenttracks.track.slice(0, 10);

    if (recentTracks.length > 0) {
      const trackList = recentTracks.map(track => `${track.name} by ${track.artist['#text']}`).join('\n');
      const prompt = `
      Based on the last 10 songs I listened to, which are listed below,
      speculate on my state of mind, then recommend no more than two similar albums that I might want to listen to next. 
      Use a numbered list.
      `;
      const fullPrompt = `${prompt}\n\n${trackList}`;
      const max_tokens = 400;

      // Fetch call with error message
      fetch(`/.netlify/functions/getOpenAI?prompt=${encodeURIComponent(fullPrompt)}&max_tokens=${max_tokens}`)
      // fetch(`/.netlify/functions/getOpenAIBonkers?prompt=${encodeURIComponent(fullPrompt)}&max_tokens=${max_tokens}`)
        .then(async response => {
          if (!response.ok) {
            const errorJson = await response.json();
            throw new Error(errorJson.error);
          }
          return response.json();
        })
        .then(openaiDataResponse => {
          const openaiTextResponse = openaiDataResponse.data.choices[0].message['content'];
          const openaiTokensUsed = openaiDataResponse.data.usage.total_tokens;

          // Split the response into paragraphs at each newline
          let paragraphs = openaiTextResponse.split('\n\n');

          let formattedResponse = '';

          // Loop through each paragraph
          for (let paragraph of paragraphs) {
            // If the paragraph starts with a digit followed by a period or a closing bracket, format it as an ordered list
            if (paragraph.match(/^\d+[\.\)]/)) {
              let listItems = paragraph.split('\n');
              formattedResponse += '<ul class="track_ul">';
              for (let listItem of listItems) {
                // Remove the digit and the following character (either period or closing bracket)
                listItem = listItem.replace(/^\d+[\.\)]\s*/, '');
                formattedResponse += `<li>${listItem}</li>`;
              }
              formattedResponse += '</ul>';
            } else {
              // Otherwise, format it as a paragraph
              formattedResponse += `<p>${paragraph}</p>`;
            }
          }

          const content = `
            <div class="openai-response">
              <p>${formattedResponse}</p>
              <p><div class="footnote"><em>Dev note: this response used ${openaiTokensUsed} OpenAI tokens.</em></div></p>
            </div>
          `;

          dataContainer.innerHTML = content;
        })
        .catch(error => {
          // Display the error message
          const errorMessage = `
            <div class="error-message">
              <p>Oops, it looks like the OpenAI API timed out. Please try again.</p>
            </div>
          `;
          dataContainer.innerHTML = errorMessage;
        });

    } else {
      const html = `
        <div class="track">
          <h2 class="track_artist">Nothing has been played recently.</h2>
        </div>
      `;
      dataContainer.innerHTML = html;
    }
  })
  .catch(error => console.error(error));
