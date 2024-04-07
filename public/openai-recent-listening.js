fetch('/getRecentTracks?limit=10')
  .then(response => response.json())
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-recent');
    const recentTracks = data.recenttracks.track.slice(0, 10);

    if (recentTracks.length > 0) {
      const trackList = recentTracks.map(track => `${track.name} by ${track.artist['#text']}`).join('\n');
      const prompt = `
      Based on the last 10 songs I listened to, which are listed below,
      speculate on the mood I'm in, then recommend two albums that I might want to listen to next to reflect my current mood. 
      Use proper paragraph spacing. Format the artist and album names in bold text.
      `;
      const fullPrompt = `${prompt}\n\n${trackList}`;
      const max_tokens = 500;

      // Fetch call with error message
       fetch(`/getOpenAI?prompt=${encodeURIComponent(fullPrompt)}&max_tokens=${max_tokens}`)
      // fetch(`/getOpenAIBonkers?prompt=${encodeURIComponent(fullPrompt)}&max_tokens=${max_tokens}`)
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

          for (let paragraph of paragraphs) {
            // Format text enclosed in ** as bold
            paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // Directly append the paragraph as formatted text without checking for list patterns
            formattedResponse += `<p>${paragraph}</p>`;
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
