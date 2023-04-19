//------------------------------------------
// Fetch Discogs added albums
//------------------------------------------
fetch('/.netlify/functions/getDiscogsCollection')
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-discogs-added');
    const discogsAdded = data.releases.slice(0, 3);

      const html = discogsAdded.map(releases => `
        <div class="track">
            <a href="https://www.discogs.com/release/${releases.basic_information.id}" target="_blank" class="track_link">
            <img src="${releases.basic_information.cover_image}" class="track_image">
            <div class="track_content">
              <h2 class="track_artist">${releases.basic_information.title}</h2>
              <p class="track_name">${releases.basic_information.artists[0].name}</p></a>
            </div>
        </div>
      `).join('');
      dataContainer.innerHTML = html;
  
  })
  .catch(error => console.error(error));