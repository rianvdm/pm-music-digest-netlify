fetch('/.netlify/functions/getLovedTracks')
  .then(response => response.json())
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-loved-tracks');
    const lovedTracks = data.lovedtracks.track.slice(0, 5);

    // Create an array of promises for each artist's data
    const trackPromises = lovedTracks.map(track => {
      return fetch(`/.netlify/functions/getArtistInfo?artist=${track.artist.name}`)
        .then(response => response.json())
        .then(async data => {
          // Check for error property in Last.fm API response
          if (typeof data.artist.tags.tag[0] === 'undefined') {
            return {
              summary: 'Last.fm unfortunately does not have any additional information on this artist.',
            };
          }

          // Return the data if it exists
          return {
            tags: data.artist.tags.tag
              .filter(tag => tag.name !== "seen live")
              .slice(0, 3),
            similarArtist: data.artist.similar.artist.slice(0,3),
          };
        })
        .catch(error => {
          console.error(error);
          return null;
        });
    });

    // Resolve all artist promises and create HTML
    Promise.all(trackPromises)
      .then(tracks => {

        const html = lovedTracks.map((track, i) => {
          if (tracks[i].summary) {
            return `
              <li class="track_ul">
                  ${tracks[i].summary}
              </li>
            `;
          } else {
            const q = `${track.name} ${track.artist.name}`
            const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
            const pacificTimezone = 'America/Los_Angeles';
            const utsDate = track.date.uts;
            const formattedDate = new Date(utsDate * 1000).toLocaleString('en-US', {
              ...optionsDate,
              timeZone: pacificTimezone
              });
            return `
              <li class="track_ul">
                <strong>${track.name}</strong></a> by <strong>${track.artist.name}</strong> (liked on ${formattedDate})
                <br><a href="https://songwhip.com/create?q=${q}" target="_blank">Stream now</a> if you like ${tracks[i].tags[0].name} / ${tracks[i].tags[1].name} music 
                from artists like ${tracks[i].similarArtist[0].name}, ${tracks[i].similarArtist[1].name}, and ${tracks[i].similarArtist[2].name}.
              </li>
            `;
          }
        }).join('');
        dataContainer.innerHTML = `<ol>${html}</ol>`;
      })
      .catch(error => console.error(error));


  })
  .catch(error => console.error(error));
