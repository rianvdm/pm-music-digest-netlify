const encodeName = (name) => encodeURIComponent(name.replace(/&/g, '%26').replace(/\+/g, '%2B').replace(/\./g, '%2E'));

fetch('/.netlify/functions/getLovedTracks')
  .then(response => response.json())
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-loved-history');
    const lovedTracks = data.lovedtracks.track.slice(0, 2);

    const trackPromises = lovedTracks.map(async track => {
      const encodedArtist = encodeName(track.artist.name);
      const encodedTrack = encodeName(track.name);

      const lastfmPromise = fetch(`/.netlify/functions/getLastfmData?type=getArtistInfo&artist=${encodedArtist}`)
        .then(response => response.json())
        .catch(error => {
          console.error(error);
          return null;
        });

      const q = `${encodedTrack} ${encodedArtist}`;
      const spotifySearchPromise = fetch(`/.netlify/functions/getSpotifySearchResults?type=getTrack&q=${q}`)
        .then(response => response.json());

      const [lastfmData, spotifyData] = await Promise.allSettled([lastfmPromise, spotifySearchPromise]);

      const lastfmTags = lastfmData.value && lastfmData.value.artist.tags.tag
        .filter(tag => tag.name.toLowerCase() !== "seen live")
        .slice(0, 2);

      const spotifyUrl = spotifyData.value.data.items[0].external_urls.spotify;
      const spotifyID = spotifyData.value.data.items[0].id;
      const spotifyArtistID = spotifyData.value.data.items[0].artists[0].id;
      const spotifyImgUrl = spotifyData.value.data.items[0].album.images[1].url;
//      const spotifyReleased = spotifyData.value.data.items[0].album.release_date;
      const spotifyGenres = (lastfmTags && lastfmTags[0]?.name)
          ? lastfmTags[0]?.name
          : "rock";

      const spotifyRecoPromise = fetch(`/.netlify/functions/getSpotifyRecommendations?seed_artists=${spotifyArtistID}&seed_genres=${spotifyGenres}&seed_tracks=${spotifyID}`)
        .then(response => response.json());

      const [spotifyRecoData] = await Promise.allSettled([spotifyRecoPromise]);

      return {
        track,
        lastfmTags,
        similarArtist: lastfmData.value && lastfmData.value.artist.similar.artist.length > 0 ? lastfmData.value.artist.similar.artist.slice(0,3) : 'N/A',
        spotifyUrl,
        spotifyID,
        spotifyImgUrl,
        spotifyRecoData,
        spotifyGenres
//        spotifyReleased
      };
    });

    const trackData = await Promise.all(trackPromises);

    const html = trackData.map(({ track, lastfmTags, similarArtist, spotifyUrl, spotifyID, spotifyImgUrl, spotifyRecoData, spotifyGenres }) => {
      const spotifyTrackReco = spotifyRecoData.value.tracks.slice(0, 3).map(track => track.name);
      const spotifyArtistReco = spotifyRecoData.value.tracks.slice(0, 3).map(track => track.artists[0].name);
      const spotifyUrlsReco = spotifyRecoData.value.tracks.slice(0, 3).map(track => track.external_urls.spotify);

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
            <br><strong>Genre:</strong> ${spotifyGenres}.
            <br><strong>Similar artists:</strong> ${similarArtist[0].name}, ${similarArtist[1].name}, ${similarArtist[2].name}.
            <br><strong>Related songs:</strong> <a href="https://odesli.co/${spotifyUrlsReco[0]}" target="_blank">${spotifyTrackReco[0]}</a> by ${spotifyArtistReco[0]} 
            and <a href="https://odesli.co/${spotifyUrlsReco[1]}" target="_blank">${spotifyTrackReco[1]}</a> by ${spotifyArtistReco[1]}.
          </div>
        </div>
      `;
    });

    dataContainer.innerHTML = `${html.join('')}`;
  })
  .catch(error => console.error(error));
