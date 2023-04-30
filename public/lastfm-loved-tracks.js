fetch('/.netlify/functions/getLovedTracks')
  .then(response => response.json())
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-loved-tracks');
    const lovedTracks = data.lovedtracks.track.slice(0, 5);

    // Create an array of promises for each artist's data
    const trackPromises = lovedTracks.map(track => {

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
            // similarArtist: data.artist.similar.artist.slice(0,3),
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

      const prompt = `Write a summary to help someone decide if they might like the song ${encodeURIComponent(track.name)} by ${encodeURIComponent(track.artist.name)}. Include information about the song/artist’s genres as well as similar artists. Write no more than one sentence.`;
      const max_tokens = 80;

      const openaiResponse = await fetch(`/.netlify/functions/getOpenAI?prompt=${prompt}&max_tokens=${max_tokens}`)
      const openaiDataResponse = await openaiResponse.json();
      const openaiTextResponse = openaiDataResponse.data.choices[0].message['content'];


      const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
      const pacificTimezone = 'America/Los_Angeles';
      const utsDate = track.date.uts;
      const formattedDate = new Date(utsDate * 1000).toLocaleString('en-US', {
        ...optionsDate,
        timeZone: pacificTimezone
      });

      if (tracks[i].summary) {
        return `
          <div class="track_ul">
            <a href="https://odesli.co/${spotifyUrl}" target="_blank"><img src="${spotifyImgUrl}"></a>
            <div class="no-wrap-text">
              <strong>${track.name}</strong> by <strong>${track.artist.name}</strong> (recommended on ${formattedDate}).
              <br><a href="https://odesli.co/${spotifyUrl}" target="_blank">Stream now</a>.
              <br>${openaiTextResponse}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="track_ul">
            <a href="https://odesli.co/${spotifyUrl}" target="_blank"><img src="${spotifyImgUrl}"></a>
            <div class="no-wrap-text">
              <strong><a href="https://odesli.co/${spotifyUrl}" target="_blank">${track.name}</a></strong> by <strong>${track.artist.name}</strong> (recommended on ${formattedDate}).
              <br>${openaiTextResponse}
              <br><em>Related songs:</em> <a href="https://odesli.co/${spotifyUrlsReco[0]}" target="_blank">${spotifyTrackReco[0]}</a> by ${spotifyArtistReco[0]} 
              and <a href="https://odesli.co/${spotifyUrlsReco[1]}" target="_blank">${spotifyTrackReco[1]}</a> by ${spotifyArtistReco[1]}.
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