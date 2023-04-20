fetch('/.netlify/functions/getTopArtists')
  .then(response => response.json())
  .then(data => {
    const dataContainer = document.querySelector('.js-lastfm-top-artists');
    const topArtists = data.topartists.artist.slice(0, 5);

    // Create an array of promises for each artist's summary and first tag
    const artistPromises = topArtists.map(artist => {
      return fetch(`/.netlify/functions/getArtistInfo?mbid=${artist.mbid}`)
        .then(response => response.json())
        .then(data => {
          // Check for error property in Last.fm API response
          if (data.error) {
            return {
              summary: 'Last.fm unfortunately does not have additional information on this artist.',
            };
          }

          // Return the summary and first tag if they exist
          return {
            tag1: data.artist.tags.tag.length > 0 ? data.artist.tags.tag[0].name : '',
            tag2: data.artist.tags.tag.length > 0 ? data.artist.tags.tag[1].name : '',
            similarArtist1: data.artist.similar.artist.length > 0 ? data.artist.similar.artist[0].name : '',
            similarArtist2: data.artist.similar.artist.length > 0 ? data.artist.similar.artist[1].name : '',
            similarArtist1URL: data.artist.similar.artist.length > 0 ? data.artist.similar.artist[0].url : '',
            similarArtist2URL: data.artist.similar.artist.length > 0 ? data.artist.similar.artist[1].url : '',
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
              <div class="track_ul">
                  ${artist['@attr'].rank}. <strong><a href="${artist.url}" target="_blank" class="track_link">${artist.name}</a></strong> (${artist.playcount} plays). 
                  ${artists[i].summary}
              </div>
            `;
          } else {
            return `
              <div class="track_ul">
                  ${artist['@attr'].rank}. <strong><a href="${artist.url}" target="_blank" class="track_link">${artist.name}</a></strong> (${artist.playcount} plays). 
                  Their primary genres are <strong>${artists[i].tag1}</strong> and <strong>${artists[i].tag2}</strong>. 
                  They are similar to <a href="${artists[i].similarArtist1URL}" target="_blank" class="track_link">${artists[i].similarArtist1}</a> and <a href="${artists[i].similarArtist2URL}" target="_blank" class="track_link">${artists[i].similarArtist2}</a>.
              </div>
            `;
          }
        }).join('');
        dataContainer.innerHTML = html;
      })
      .catch(error => console.error(error));


  })
  .catch(error => console.error(error));
