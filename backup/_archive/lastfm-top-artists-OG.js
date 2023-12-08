fetch('/.netlify/functions/getTopArtists')
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-lastfm-top-artists');
    const topArtists = data.topartists.artist.slice(0, 6);

    // Create an array of promises for each artist's data
    const artistPromises = topArtists.map(artist => {
      return fetch(`/.netlify/functions/getArtistInfo?artist=${artist.name}`)
        .then(response => response.json())
        .then(data => {
          // Check for error property in Last.fm API response
          if (typeof data.artist.tags.tag[0] === 'undefined') {
            return {
              summary: 'Last.fm unfortunately does not have any additional information on this artist.',
            };
          }

          // Return the data if it exists
          return {
            tag1: data.artist.tags.tag.length > 0 ? data.artist.tags.tag[0].name : '',
            tag2: data.artist.tags.tag.length > 0 ? data.artist.tags.tag[1].name : '',
            similarArtist1: data.artist.similar.artist.length > 0 ? data.artist.similar.artist[0].name : '',
            similarArtist2: data.artist.similar.artist.length > 0 ? data.artist.similar.artist[1].name : '',
            similarArtist3: data.artist.similar.artist.length > 0 ? data.artist.similar.artist[2].name : '',
            similarArtist1URL: data.artist.similar.artist.length > 0 ? data.artist.similar.artist[0].url : '',
            similarArtist2URL: data.artist.similar.artist.length > 0 ? data.artist.similar.artist[1].url : '',
            similarArtist3URL: data.artist.similar.artist.length > 0 ? data.artist.similar.artist[2].url : '',
          };
        })
        .catch(error => {
          console.error(error);
          return null;
        });
    });

    // Resolve all artist promises and create HTML
    Promise.all(artistPromises)
      .then(artists => {
        const html = topArtists.map((artist, i) => {
          if (artists[i].summary) {
            return `
              <li class="track_ul">
                  <strong><a href="${artist.url}" target="_blank" class="track_link">${artist.name}</a></strong> (${artist.playcount} plays). 
                  ${artists[i].summary}
              </li>
            `;
          } else {
            return `
              <li class="track_ul">
                  <strong><a href="${artist.url}" target="_blank" class="track_link">${artist.name}</a></strong>: ${artist.playcount} plays (${artists[i].tag1} / ${artists[i].tag2}). 
                  Similar artists: <a href="${artists[i].similarArtist1URL}" target="_blank" class="track_link">${artists[i].similarArtist1}</a>, <a href="${artists[i].similarArtist2URL}" target="_blank" class="track_link">${artists[i].similarArtist2}</a>, and <a href="${artists[i].similarArtist3URL}" target="_blank" class="track_link">${artists[i].similarArtist3}</a>.
              </li>
            `;
          }
        }).join('');
        dataContainer.innerHTML = `<ol>${html}</ol>`;
      })
      .catch(error => console.error(error));


  })
  .catch(error => console.error(error));
