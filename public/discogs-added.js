//------------------------------------------
// Fetch Discogs added albums
//------------------------------------------
fetch('/.netlify/functions/getDiscogsCollection')
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-discogs-added');
    const discogsAdded = data.releases.slice(0, 6);

      const html = discogsAdded.map(releases => {
      const dateAdded = releases.date_added;
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = new Date(dateAdded).toLocaleDateString('en-US', options);

      return `
        <div class="track">
          <a href="https://www.discogs.com/release/${releases.basic_information.id}" target="_blank" class="track_link">
            <img src="${releases.basic_information.cover_image}" class="track_image">
            <div class="track_content">
              <h2 class="track_artist">${releases.basic_information.title}</h2>
              <p class="track_name">${releases.basic_information.artists[0].name}</p></a>
              <p class="track_album">${releases.basic_information.formats[0].name} added on ${formattedDate}.</p>
              <p class="track_album">It is a ${releases.basic_information.genres[0]} album 
              on the ${releases.basic_information.labels[0].name} label and it
              ${releases.basic_information.year != 0 ? `was released in ${releases.basic_information.year}.` : `has an unknown release date.`}</p>
            </div>
        </div>
      `;
    }).join('');
      dataContainer.innerHTML = html;
  
  })
  .catch(error => console.error(error));
