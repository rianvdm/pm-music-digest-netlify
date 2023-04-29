fetch('/.netlify/functions/getTopTracks?period=3month') // overall | 7day | 1month | 3month | 6month | 12month
  .then(response => response.json())
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-top10-tracks');
    const topTracks = data.toptracks.track.slice(0, 10);

    // Create an array of promises for each artist's data
    const trackPromises = topTracks.map(track => {

      const artistName = track.artist.name
        .replace(/&/g, '%26')
        .replace(/\+/g, '%2B');
      const encodedName = encodeURIComponent(artistName);

      return fetch(`/.netlify/functions/getLastfmData?type=getArtistInfo&artist=${encodedName}`)
        .then(response => response.json())
        .then(async data => {
          // Check for error property in Last.fm API response
          if (typeof data.artist.tags.tag[0] === 'undefined' || data.artist.similar.artist.length === 0) {
            return {
              summary: 'Last.fm unfortunately does not have any additional information on this artist.',
            };
          }


          // Return the data if it exists
          return {
            tags: data.artist.tags.tag
              .filter(tag => tag.name.toLowerCase() !== "seen live")
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
      const html = await Promise.all(topTracks.map(async (track, i) => {

      const q = `${track.name} ${track.artist.name}`;
      const spotifyResponse = await fetch(`/.netlify/functions/getSpotifySearchResults?type=getTrack&q=${encodeURIComponent(q)}`);
      const spotifyData = await spotifyResponse.json();
      const spotifyUrl = spotifyData.data.items[0].external_urls.spotify;
      const spotifyID = spotifyData.data.items[0].id;
      const spotifyArtistID = spotifyData.data.items[0].artists[0].id;
      const spotifyImgUrl = spotifyData.data.items[0].album.images[1].url;

      const spotifyResponseReco = await fetch(`/.netlify/functions/getSpotifyRecommendations?seed_artists=${spotifyArtistID}&seed_genres=${tracks[i].tags[0].name}, ${tracks[i].tags[1].name}&seed_tracks=${spotifyID}`);
      const spotifyDataReco = await spotifyResponseReco.json();
      const spotifyTrackReco = spotifyDataReco.tracks.slice(0, 3).map(track => track.name);
      const spotifyArtistReco = spotifyDataReco.tracks.slice(0, 3).map(track => track.artists[0].name);
      const spotifyUrlsReco = spotifyDataReco.tracks.slice(0, 3).map(track => track.external_urls.spotify);

      if (tracks[i].summary) {
        return `
          <li class="track_ol">
              <a href="https://odesli.co/${spotifyUrl}" target="_blank"><strong>${track.name}</strong></a>
              by <strong>${track.artist.name}</strong> (${track.playcount} plays).
          </li>
              <p>${tracks[i].summary}
              Also try <a href="https://odesli.co/${spotifyUrlsReco[0]}" target="_blank">${spotifyTrackReco[0]}</a> by ${spotifyArtistReco[0]} 
              and <a href="https://odesli.co/${spotifyUrlsReco[1]}" target="_blank">${spotifyTrackReco[1]}</a> by ${spotifyArtistReco[1]}.
              <br><br><iframe class="spotify-iframe" src="https://open.spotify.com/embed/track/${spotifyID}"
              width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe><br><br>
          </p>
        `;
      } else {
        return `
          <li class="track_ol">
              <a href="https://odesli.co/${spotifyUrl}" target="_blank"><strong>${track.name}</strong></a>
              by <strong>${track.artist.name}</strong> (${track.playcount} plays).
          </li>
              <p>Try it if you like ${tracks[i].tags[0].name} / ${tracks[i].tags[1].name} music from artists like ${tracks[i].similarArtist[0].name}, ${tracks[i].similarArtist[1].name}, and ${tracks[i].similarArtist[2].name}.
              Also try <a href="https://odesli.co/${spotifyUrlsReco[0]}" target="_blank">${spotifyTrackReco[0]}</a> by ${spotifyArtistReco[0]} 
              and <a href="https://odesli.co/${spotifyUrlsReco[1]}" target="_blank">${spotifyTrackReco[1]}</a> by ${spotifyArtistReco[1]}.
              <br><br><iframe class="spotify-iframe" src="https://open.spotify.com/embed/track/${spotifyID}"
              width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe><br><br>
          </p>
        `;
      }
    }));
    dataContainer.innerHTML = `<ol>${html.join('')}</ol>`;
  })
  .catch(error => console.error(error));



  })
  .catch(error => console.error(error));
