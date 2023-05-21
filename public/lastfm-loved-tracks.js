const checkStatus = (response) => {
  if (response.ok) {
    return response.json();
  } else {
    return response.json().then(json => {
      throw new Error(json.message || 'Request failed');
    });
  }
};

const encodeName = (name) => encodeURIComponent(name.replace(/&/g, '%26').replace(/\+/g, '%2B').replace(/\./g, '%2E'));

fetch('/.netlify/functions/getLovedTracks?limit=5')
  .then(checkStatus)
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-loved-tracks');
    const lovedTracks = data.lovedtracks.track.slice(0, 5);

    const trackPromises = lovedTracks.map(async track => {
      const encodedArtist = encodeName(track.artist.name);
      const encodedTrack = encodeName(track.name);

      const lastfmPromise = fetch(`/.netlify/functions/getLastfmData?type=getArtistInfo&artist=${encodedArtist}`)
        .then(checkStatus)
        .catch(error => {
          dataContainer.innerHTML = `<p>Error: ${error.message}</p>`;
          console.error(error);
          return null;
        });

     const q = `${encodedTrack} ${encodedArtist}`;
     const spotifySearchPromise = fetch(`/.netlify/functions/getSpotifySearchResults?type=getTrack&q=${q}`)
        .then(checkStatus)
        .catch(error => {
          console.error(error);
          dataContainer.innerHTML = `<p>Error: ${error.message}</p>`;
        });

      const [lastfmData, spotifyData] = await Promise.allSettled([lastfmPromise, spotifySearchPromise]);

      if (lastfmData.status === 'rejected') {
        console.error(lastfmData.reason);
        dataContainer.innerHTML += `<p>Error: ${lastfmData.reason.message}</p>`;
        return;
      }

      if (spotifyData.status === 'rejected') {
        console.error(spotifyData.reason);
        dataContainer.innerHTML += `<p>Error: ${spotifyData.reason.message}</p>`;
        return;
      }

      const lastfmTags = lastfmData.value && lastfmData.value.artist.tags.tag
        .filter(tag => tag.name.toLowerCase() !== "seen live")
        .slice(0, 2);

      const lastfmGenres = (lastfmTags && lastfmTags[0]?.name)
      ? lastfmTags[0]?.name.charAt(0).toUpperCase() + lastfmTags[0]?.name.slice(1)
      : "Rock";

      const lastfmGenres2 = (lastfmTags && lastfmTags[1]?.name)
      ? lastfmTags[1]?.name.toLowerCase()
      : "Pop";

      const similarArtist = lastfmData.value && lastfmData.value.artist.similar.artist.length > 0 ? lastfmData.value.artist.similar.artist.slice(0,3) : 'N/A';

      const spotifyUrl = spotifyData.value.data.items[0].external_urls.spotify;
      const spotifyID = spotifyData.value.data.items[0].id;
      const spotifyArtistID = spotifyData.value.data.items[0].artists[0].id;
      const spotifyImgUrl = spotifyData.value.data.items[0].album.images[1].url;
      const spotifyReleased = spotifyData.value.data.items[0].album.release_date;
      const spotifyYear = spotifyData.length === 4 ? spotifyReleased : spotifyReleased.substring(0, 4);
      const spotifyGenres = (lastfmTags && lastfmTags[0]?.name)
           ? lastfmTags[0]?.name
           : "rock";

      const spotifyRecoPromise = fetch(`/.netlify/functions/getSpotifyRecommendations?seed_artists=${spotifyArtistID}&seed_genres=${spotifyGenres}&seed_tracks=${spotifyID}`)
        .then(checkStatus)
        .catch(error => {
          console.error(error);
          dataContainer.innerHTML = `<p>Error: ${error.message}</p>`;
        });

      // const prompt = `Write a summary to help someone decide if they might like the song ${encodeURIComponent(track.name)} by ${encodeURIComponent(track.artist.name)}. Include information about the song/artist’s genres, as well as similar artists. Write no more than one sentence.`;
      // const max_tokens = 80;

      // const openaiPromise = fetch(`/.netlify/functions/getOpenAI?prompt=${prompt}&max_tokens=${max_tokens}`)
      //   .then(checkStatus)
      //   .catch(error => {
      //     console.error(error);
      //     dataContainer.innerHTML = `<p>Error: ${error.message}</p>`;
      //   });

      // const [spotifyRecoData, openaiData] = await Promise.allSettled([spotifyRecoPromise, openaiPromise]);
        const [spotifyRecoData] = await Promise.allSettled([spotifyRecoPromise]);

        if (spotifyRecoData.status === 'rejected') {
          console.error(spotifyRecoData.reason);
          dataContainer.innerHTML += `<p>Error: ${spotifyRecoData.reason.message}</p>`;
          return;
        }

        // if (openaiData.status === 'rejected') {
        //   console.error(openaiData.reason);
        //   dataContainer.innerHTML += `<p>Error: ${openaiData.reason.message}</p>`;
        //   return;
        // }

      return {
        track,
        lastfmGenres,
        lastfmGenres2,
        similarArtist,
        spotifyUrl,
        spotifyImgUrl,
        spotifyRecoData,
//        openaiData,
        spotifyYear
      };
    });

    const trackData = await Promise.all(trackPromises);

    const html = trackData.map(({ track, lastfmGenres, lastfmGenres2, similarArtist, spotifyUrl, spotifyImgUrl, spotifyRecoData, spotifyYear }) => {
      const spotifyTrackReco = spotifyRecoData.value.tracks.slice(0, 3).map(track => track.name);
      const spotifyArtistReco = spotifyRecoData.value.tracks.slice(0, 3).map(track => track.artists[0].name);
      const spotifyUrlsReco = spotifyRecoData.value.tracks.slice(0, 3).map(track => track.external_urls.spotify);

//      const openaiTextResponse = openaiData.value.data.choices[0].message['content'];

      const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
      const pacificTimezone = 'America/Los_Angeles';
      const utsDate = track.date.uts;
      const formattedDate = new Date(utsDate * 1000).toLocaleString('en-US', {
        ...optionsDate,
        timeZone: pacificTimezone
      });

      return `
        <div class="track_ul">
          <a href="/search-song?song=${track.name}%20${track.artist.name}"><img src="${spotifyImgUrl}"></a>
          <div class="no-wrap-text">
            <strong><a href="/search-song?song=${track.name}%20${track.artist.name}">${track.name}</a></strong> by <strong><a href="/search?artist=${track.artist.name}">${track.artist.name}</a></strong> (recommended on ${formattedDate}).
            <br><strong>Details:</strong> ${lastfmGenres}/${lastfmGenres2} song released in ${spotifyYear}.
            <br><strong>Similar artists:</strong> <a href="/search?artist=${similarArtist[0].name}">${similarArtist[0].name}</a>, <a href="/search?artist=${similarArtist[1].name}">${similarArtist[1].name}</a>, and <a href="/search?artist=${similarArtist[2].name}">${similarArtist[2].name}</a>.
            <br><strong>Related songs:</strong> <a href="/search-song?song=${spotifyTrackReco[0]}%20${spotifyArtistReco[0]}">${spotifyTrackReco[0]}</a> by ${spotifyArtistReco[0]} 
            and <a href="/search-song?song=${spotifyTrackReco[1]}%20${spotifyArtistReco[1]}">${spotifyTrackReco[1]}</a> by ${spotifyArtistReco[1]}.
          </div>
        </div>
      `;
    });

    dataContainer.innerHTML = `${html.join('')}`;
  })
  .catch(error => {
    const dataContainer = document.querySelector('.js-lastfm-loved-tracks');
    console.error(error);
    dataContainer.innerHTML = `<p>Error: ${error.message}</p>`;
  });

