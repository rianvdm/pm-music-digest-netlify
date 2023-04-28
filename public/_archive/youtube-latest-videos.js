fetch(`/.netlify/functions/getRecentTracks`)
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-now-playing');
    const nowPlaying = [data.recenttracks.track[0]]; 

    const artist = nowPlaying[0].artist['#text'];
    const title = nowPlaying[0].name;
    const q = `${artist} ${title}`;

    fetch(`/.netlify/functions/getYouTubeVideos?q=${q}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch YouTube videos');
        }
        return response.json();
      })
      .then(data => {
        const dataContainer = document.querySelector('.js-youtube-latest-videos');
        const youtubeVideo = data.items[0];

        const html = `
          <div class="track_recent">
            <p style="text-align: center;">You can listen to this track on YouTube below, or <a href="https://songwhip.com/https://www.youtube.com/watch?v=${youtubeVideo.id.videoId}" target="_blank">click here</a> to listen on your favorite streaming service.
          </div>
          <div class="videoWrapper">
            <p><iframe src="https://www.youtube.com/embed/${youtubeVideo.id.videoId}"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope;"
            allowfullscreen></iframe></p>
          </div>
        `;
        dataContainer.innerHTML = html;
      })
      .catch(error => {
        console.error(error);
        // display error message to user
        const dataContainer = document.querySelector('.js-youtube-latest-videos');
                const html = `
          <p class="track_recent" style="text-align: center;"><strong>Oops, it looks like I’ve reached my YouTube API request quota for the day.</strong> The YouTube Embed should work again tomorrow!
          You can <a href="https://www.youtube.com/results?search_query=${q}" target="_blank">click here</a> to search for ${title} by ${artist} directly on the YouTube site.</p>
        `;
        dataContainer.innerHTML = html;
      });
  })
  .catch(error => console.error(error));
