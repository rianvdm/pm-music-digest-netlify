function fetchUserRecentTracks() {
  const username = document.getElementById('lastFmUsername').value.trim();
  if (!username) {
    console.error('Username is required');
    return; // Exit the function if no username is provided
  }

  // Immediately show the loading message in the '.js-lastfm-recent' container
  const dataContainer = document.querySelector('.js-lastfm-recent');
  dataContainer.innerHTML = '<p style="text-align: center;">Loading... (please be patient, it can take up to 10 seconds for ChatGPT to generate this text)</p>';

  fetch(`/getRecentTracksUserName?user=${encodeURIComponent(username)}&limit=10`)
    .then(response => response.json())
    .then(data => {
      const recentTracks = data.recenttracks.track.slice(0, 10);

      if (recentTracks.length > 0) {
        const tracksHtml = recentTracks.map(track => `
            <li class="track_recent">
              ${track.name} by ${track.artist['#text']}.
            </li>
        `).join('');

        const content = `
          <div class="recent-tracks">
            <p><strong>Here are your 10 most recent tracks:</strong></p>
            <ul>
              ${tracksHtml}
            </ul>
          </div>
        `;

        document.querySelector('.js-lastfm-recent-history-username').innerHTML = content;

        const trackList = recentTracks.map(track => `${track.name} by ${track.artist['#text']}`).join('\n');
        const prompt = `
        Based on the last 10 songs I listened to, speculate on the mood I'm in, 
        then recommend two albums that I might want to listen to next to reflect my current mood. 
        Recommend albums by artists that are NOT on the list of the last 10 songs.
        Avoid albums that are very popular and mainstream, instead recommending what could be considered "hidden gems".
        Use proper paragraph spacing. Display the artist and album names as **<album> by <artist>**.
        `;
        const fullPrompt = `${prompt}\n\n${trackList}`;
        const max_tokens = 500;

        fetch(`/.netlify/functions/getOpenAI?prompt=${encodeURIComponent(fullPrompt)}&max_tokens=${max_tokens}`)
          .then(response => response.json())
          .then(openaiDataResponse => {
            const openaiTextResponse = openaiDataResponse.data.choices[0].message['content'];
            let paragraphs = openaiTextResponse.split('\n\n');

            let formattedResponse = paragraphs.map(paragraph => {
              // Wrap each paragraph in <p> tags and apply the same transformation for bold text
              return `<p>${paragraph.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
                // Encode the entire bold text for the URL
                const queryEncoded = encodeURIComponent(p1.trim());
                // Construct URL using the entire encoded text
                const url = `/search-album?album=${queryEncoded}`;
                // Replace bold text with a link wrapped in <strong> tags
                return `<a href="${url}"><strong>${p1}</strong></a>`;
              })}</p>`;
            }).join(''); // Join without adding any additional characters, as <p> tags now serve as separators

            dataContainer.innerHTML = `<div class="openai-response">${formattedResponse}</div>`;
          })
          .catch(error => {
            console.error('Error fetching OpenAI response:', error);
            dataContainer.innerHTML = '<div class="error-message"><p>Oops, it looks like the OpenAI API timed out. Please try again.</p></div>';
          });

      } else {
        document.querySelector('.js-lastfm-recent-history-username').innerHTML = '<div class="track"><h2 class="track_artist">Nothing has been played recently.</h2></div>';
      }
    })
    .catch(error => {
      console.error('Error fetching recent tracks:', error);
      dataContainer.innerHTML = '<div class="error-message"><p>Error fetching recent tracks. Please try again later.</p></div>';
    });
}

// Add an event listener to the input field for the Enter key press
document.getElementById('lastFmUsername').addEventListener('keypress', function(event) {
  if (event.key === 'Enter' || event.keyCode === 13) { // Check if Enter was pressed
    event.preventDefault(); // Prevent the default action to avoid submitting the form if it's part of one
    fetchUserRecentTracks(); // Call the function to fetch recent tracks
  }
});
