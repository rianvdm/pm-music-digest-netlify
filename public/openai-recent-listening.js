fetch('/.netlify/functions/getRecentTracks?limit=10')
  .then(response => response.json())
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-recent');
    const recentTracks = data.recenttracks.track.slice(0, 10);

    if (recentTracks.length > 0) {
      const trackList = recentTracks.map(track => `${track.name} by ${track.artist['#text']}`).join('\n');
      const prompt = `Analyze the last 10 songs I listened to, listed below. 
      Speculate on what what mood I might be in based on the last 10 songs, then recommend up to two similar albums that I might want to listen to next.
      List the albums in the format 1. and 2.
      `;
      const fullPrompt = `${prompt}\n\n${trackList}`;
      const max_tokens = 400;

      // Fetch call with error message
      fetch(`/.netlify/functions/getOpenAI?prompt=${encodeURIComponent(fullPrompt)}&max_tokens=${max_tokens}`)
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

          // Find the position of the numbering
          const listStartRegex = /^(1\. )/m;
          const listStartIndex = openaiTextResponse.search(listStartRegex);

          // Split the text into two parts: before and after the numbering
          const textBeforeList = openaiTextResponse.substring(0, listStartIndex);
          const listText = openaiTextResponse.substring(listStartIndex);

          // Convert the numbered list into an ordered list
          const listItemsRegex = /^(\d+\. )((.|\n)+?)(?=\n\d+\. |$)/gm;
          const orderedList = listText.replace(listItemsRegex, (match, number, content) => {
            const listItemContent = content.replace(/\n/g, ' ');
            return `<li>${listItemContent}</li>`;
          });
          const wrappedOrderedList = `<ol class="track_ol">${orderedList}</ol>`;

          // Combine the text and the ordered list, and insert into the data container
          const formattedResponse = `${textBeforeList}${wrappedOrderedList}`;

          const content = `
            <div class="openai-response">
              <p>${formattedResponse}</p>
            </div>
          `;

          dataContainer.innerHTML = content;
        })
        .catch(error => {
          // Display the error message
          const errorMessage = `
            <div class="error-message">
              <p>Oops, it looks like the OpenAI API timed out. Please try again.
              <br><br>PS. I need a paid Netlify account to increase the timeout above 10s, which is why this sometimes happens. 
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
