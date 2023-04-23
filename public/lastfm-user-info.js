fetch('/.netlify/functions/getUserInfo')
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-user-info');
    const userInfo = data.user;

    const html = `
      <div class="track_none">
        <p>My name is <a href="https://elezea.com" class="track_link">Rian</a> and as of right now I have listened to a total of <strong>${new Intl.NumberFormat().format(userInfo.track_count)} songs</strong> 
        by <strong>${new Intl.NumberFormat().format(userInfo.artist_count)} artists</strong> on 
        <strong>${new Intl.NumberFormat().format(userInfo.album_count)} albums</strong>.</p>
      </div>


    `;
    dataContainer.innerHTML = html; 
  

  })

  .catch(error => console.error(error));


