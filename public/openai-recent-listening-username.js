function fetchUserRecentTracks() {
  const username = document.getElementById('lastFmUsername').value.trim();
  if (!username) {
    console.error('Username is required');
    return; // Exit the function if no username is provided
  }

  fetch(`/.netlify/functions/getRecentTracksUserName?user=${encodeURIComponent(username)}&limit=10`)
    .then(response => response.json())
    .then(data => {
      const dataContainer = document.querySelector('.js-lastfm-recent');
      const recentTracks = data.recenttracks.track.slice(0, 10);

      if (recentTracks.length > 0) {
        // Generate HTML for each track
        const tracksHtml = recentTracks.map(track => `
            <li class="track_recent">
              ${track.name} by ${track.artist['#text']}.
            </li>
        `).join('');

        // Wrap the tracks in a div and ul, and directly insert this HTML
        const content = `
          <div class="recent-tracks">
            <p><strong>Here are your 10 most recent tracks:</strong></p>
            <ul>
              ${tracksHtml}
            </ul>
          </div>
        `;

        // Replace the "Loading recent tracks..." message with the actual tracks list
        document.querySelector('.js-lastfm-recent-history-username').innerHTML = content;

        const trackList = recentTracks.map(track => `${track.name} by ${track.artist['#text']}`).join('\n');
        const prompt = `
        Based on the last 10 songs I listened to, which are listed below,
        speculate on the mood I'm in, then recommend two albums that I might want to listen to next to reflect my current mood.
        Recommend albums by artists that are NOT on the list of the last 10 songs.
        Use proper paragraph spacing. Format the artist and album names in bold text.
        `;
        const fullPrompt = `${prompt}\n\n${trackList}`;
        const max_tokens = 500;

        // Fetch call to OpenAI with the updated prompt including dynamic username tracks
        fetch(`/.netlify/functions/getOpenAI?prompt=${encodeURIComponent(fullPrompt)}&max_tokens=${max_tokens}`)
          .then(response => response.json())
          .then(openaiDataResponse => {
            const openaiTextResponse = openaiDataResponse.data.choices[0].message['content'];
            const openaiTokensUsed = openaiDataResponse.data.usage.total_tokens;

            let paragraphs = openaiTextResponse.split('\n\n');
            let formattedResponse = paragraphs.map(paragraph => 
              `<p>${paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`
            ).join('');

            // Now replace the "Loading..." message for the OpenAI response
            dataContainer.innerHTML = `
              <div class="openai-response">
                ${formattedResponse}
              </div>
            `;
          })
          .catch(error => {
            console.error('Error fetching OpenAI response:', error);
            // Replace the "Loading..." message with an error message
            dataContainer.innerHTML = `
              <div class="error-message">
                <p>Oops, it looks like the OpenAI API timed out. Please try again.</p>
              </div>
            `;
          });

      } else {
        // If no recent tracks are found, update the HTML to reflect that
        document.querySelector('.js-lastfm-recent-history-username').innerHTML = `
          <div class="track">
            <h2 class="track_artist">Nothing has been played recently.</h2>
          </div>
        `;
      }
    })
    .catch(error => console.error('Error fetching recent tracks:', error));
}
