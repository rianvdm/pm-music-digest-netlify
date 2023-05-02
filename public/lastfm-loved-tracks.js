fetch('/.netlify/functions/getLovedTracks')
  .then(response => response.json())
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-loved-tracks');
    const lovedTracks = data.lovedtracks.track.slice(0, 5);

    const trackPromises = lovedTracks.map(async track => {
      const artistName = track.artist.name
        .replace(/&/g, '%26')
        .replace(/\+/g, '%2B')
        .replace(/\./g, '%2E');
      const encodedArtist = encodeURIComponent(artistName);
      const trackName = track.name
        .replace(/&/g, '%26')
        .replace(/\+/g, '%2B')
        .replace(/\./g, '%2E');
      const encodedTrack = encodeURIComponent(trackName);

      const q = `${encodedTrack} ${encodedArtist}`;

      const spotifySearchPromise = fetch(`/.netlify/functions/getSpotifySearchResults?type=getTrack&q=${q}`)
        .then(response => response.json());

      const [spotifyData] = await Promise.allSettled([spotifySearchPromise]);

      const spotifyUrl = spotifyData.value.data.items[0].external_urls.spotify;
      const spotifyID = spotifyData.value.data.items[0].id;
      const spotifyArtistID = spotifyData.value.data.items[0].artists[0].id;
      const spotifyImgUrl = spotifyData.value.data.items[0].album.images[1].url;
      const spotifyGenres = "indie, jazz, rock";

      const spotifyRecoPromise = fetch(`/.netlify/functions/getSpotifyRecommendations?seed_artists=${spotifyArtistID}&seed_genres=${spotifyGenres}&seed_tracks=${spotifyID}`)
        .then(response => response.json());

      const prompt = `Write a summary to help someone decide if they might like the song ${encodeURIComponent(track.name)} by ${encodeURIComponent(track.artist.name)}. Include information about the song/artist’s genres as well as similar artists. Write no more than one sentence.`;
      const max_tokens = 80;

      const openaiPromise = fetch(`/.netlify/functions/getOpenAI?prompt=${prompt}&max_tokens=${max_tokens}`)
        .then(response => response.json());

      const [spotifyRecoData, openaiData] = await Promise.allSettled([spotifyRecoPromise, openaiPromise]);

      return {
        track,
        spotifyUrl,
        spotifyID,
        spotifyImgUrl,
        spotifyRecoData,
        openaiData
      };
    });

    const trackData = await Promise.all(trackPromises);

    const html = trackData.map(({ track, spotifyUrl, spotifyID, spotifyImgUrl, spotifyRecoData, openaiData }) => {
      const spotifyTrackReco = spotifyRecoData.value.tracks.slice(0, 3).map(track => track.name);
      const spotifyArtistReco = spotifyRecoData.value.tracks.slice(0, 3).map(track => track.artists[0].name);
      const spotifyUrlsReco = spotifyRecoData.value.tracks.slice(0, 3).map(track => track.external_urls.spotify);

      const openaiTextResponse = openaiData.value.data.choices[0].message['content'];

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
            <strong><a href="https://odesli.co/${spotifyUrl}" target="_blank">${track.name}</a></strong> by <strong>${track.artist.name}</strong> (recommended on ${formattedDate}).
            <br>${openaiTextResponse}
            <br><em>Related songs:</em> <a href="https://odesli.co/${spotifyUrlsReco[0]}" target="_blank">${spotifyTrackReco[0]}</a> by ${spotifyArtistReco[0]} 
            and <a href="https://odesli.co/${spotifyUrlsReco[1]}" target="_blank">${spotifyTrackReco[1]}</a> by ${spotifyArtistReco[1]}.
          </div>
        </div>
      `;
    });

    dataContainer.innerHTML = `${html.join('')}`;
  })
  .catch(error => console.error(error));
