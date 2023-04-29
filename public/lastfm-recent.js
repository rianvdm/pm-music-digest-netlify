fetch('/.netlify/functions/getRecentTracks')
  .then(response => response.json())
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-recent');
    const recentTracks = data.recenttracks.track.slice(0, 10);

    if (recentTracks.length > 0) {
      const trackList = recentTracks.map(track => `${track.name} by ${track.artist['#text']}`).join('\n');
      const prompt = `Analyze the last 10 songs I listened to, listed below. Speculate on what mood I am in, and recommend one or two similar albums I might want to listen to next`;
      const fullPrompt = `${prompt}\n\n${trackList}`;
      const max_tokens = 2000;

      const openaiResponse = await fetch(`/.netlify/functions/getOpenAI?prompt=${encodeURIComponent(fullPrompt)}&max_tokens=${max_tokens}`);
      const openaiDataResponse = await openaiResponse.json();
      const openaiTextResponse = openaiDataResponse.data.choices[0].text;

      const html = recentTracks.map(track => `
        <li class="track_recent">
          <a href="${track.url}" target="_blank" class="track_link">${track.name}</a> by ${track.artist['#text']}
        </li>
      `).join('');

      const content = `
        <div class="openai-response">
          <p>${openaiTextResponse}</p>
          <p>Here are the 10 most recent tracks, for reference:</p>
          <ul>
            ${html}
          </ul>
      `;

      dataContainer.innerHTML = content;
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
