fetch('/.netlify/functions/getLovedTracks')
  .then(response => response.json())
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-loved-tracks');
    const lovedTracks = data.lovedtracks.track.slice(0, 6);

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
  .then(async tracks => {
    const html = await Promise.all(lovedTracks.map(async (track, i) => {

      const q = `${track.name} ${track.artist.name}`;
      const spotifyResponse = await fetch(`/.netlify/functions/getSpotifySong?q=${encodeURIComponent(q)}`);
      const spotifyData = await spotifyResponse.json();
      const spotifyUrl = spotifyData.tracks.items[0].external_urls.spotify;
      const spotifyID = spotifyData.tracks.items[0].id;
      const spotifyArtistID = spotifyData.tracks.items[0].artists.id;
      const spotifyImgUrl = spotifyData.tracks.items[0].album.images[1].url;

      if (tracks[i].summary) {
        return `
          <div class="track_ul">
            ${tracks[i].summary}
          </div>
        `;
      } else {
        const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
        const pacificTimezone = 'America/Los_Angeles';
        const utsDate = track.date.uts;
        const formattedDate = new Date(utsDate * 1000).toLocaleString('en-US', {
          ...optionsDate,
          timeZone: pacificTimezone
        });
        return `
          <div class="track_ul">
            <a href="https://odesli.co/${spotifyUrl}" target="_blank"><img src="${spotifyImgUrl}"></a>
            <div class="no-wrap-text">
              <strong>${track.name}</strong> by <strong>${track.artist.name}</strong> (recommended on ${formattedDate}).
              <br><a href="https://odesli.co/${spotifyUrl}" target="_blank">Stream now</a> if you like ${tracks[i].tags[0].name} / ${tracks[i].tags[1].name} music from artists like ${tracks[i].similarArtist[0].name}, ${tracks[i].similarArtist[1].name}, and ${tracks[i].similarArtist[2].name}.
            </div>
          </div>
        `;
      }
    }));
    dataContainer.innerHTML = `${html.join('')}`;
  })
  .catch(error => console.error(error));



  })
  .catch(error => console.error(error));

// <br><br><iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/${spotifyID}"
// width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe><br><br>