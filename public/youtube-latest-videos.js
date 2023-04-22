fetch(`/.netlify/functions/getRecentTracks`)
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-now-playing');
    const nowPlaying = [data.recenttracks.track[0]]; 

    const artist = nowPlaying[0].artist['#text'];
    const title = nowPlaying[0].name;
    const q = `${artist} ${title}`;

fetch(`/.netlify/functions/getYouTubeVideos?q=${q}`)
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-youtube-latest-videos');
    const youtubeVideo = data.items[0];

    const html = `
        <div class="videoWrapper">
           <p><iframe src="https://www.youtube.com/embed/${youtubeVideo.id.videoId}"
              frameborder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope;"
              allowfullscreen></iframe></p>
        </div>
      `;
      dataContainer.innerHTML = `${html}`;

  })

})

.catch(error => console.error(error));
