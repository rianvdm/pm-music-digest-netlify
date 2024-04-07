const encodeName = (name) => encodeURIComponent(name.replace(/&/g, '%26').replace(/\+/g, '%2B').replace(/\./g, '%2E'));

async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

async function getRecentTracks() {
  try {
    const data = await fetchData('/getRecentTracks?limit=1');
    const dataContainer = document.querySelector('.js-spotify-recommendations');
    const nowPlaying = [data.recenttracks.track[0]];

    const encodedArtist = encodeName(nowPlaying[0].artist['#text']);
    const encodedTrack = encodeName(nowPlaying[0].name);

    const q = `${encodedTrack} ${encodedArtist}`;
    const spotifySearchData = await fetchData(`/.netlify/functions/getSpotifySearchResults?type=getTrack&q=${q}`);
    
    if (spotifySearchData.status === 'rejected') {
      console.error(spotifySearchData.reason);
      dataContainer.innerHTML += `<p>Error: ${spotifySearchData.reason.message}</p>`;
      return;
    }

    const spotifyTrackName = spotifySearchData.data.items[0].name;
    const spotifyUrl = spotifySearchData.data.items[0].external_urls.spotify;
    const spotifyID = spotifySearchData.data.items[0].id;
    const spotifyArtistID = spotifySearchData.data.items[0].artists[0].id;

    const spotifyArtistData = await fetchData(`/.netlify/functions/getSpotifySearchResults?type=getArtist&q=${encodedArtist}`);
    const spotifyArtistName = spotifyArtistData.data.items[0].name;
    const spotifyGenreList = spotifyArtistData.data.items[0].genres.slice(0, 3);

    const spotifyGenres = `${spotifyGenreList[0]},${spotifyGenreList[1]}`;

    const spotifyRecoData = await fetchData(`/.netlify/functions/getSpotifyRecommendations?seed_artists=${spotifyArtistID}&seed_genres=${spotifyGenres}&seed_tracks=${spotifyID}`);

    if (spotifyRecoData.status === 'rejected') {
      console.error(spotifyRecoData.reason);
      dataContainer.innerHTML += `<p>Error: ${spotifyRecoData.reason.message}</p>`;
      return;
    }

    const spotifyTrackReco = spotifyRecoData.tracks.slice(0, 3).map(track => track.name);
    const spotifyArtistReco = spotifyRecoData.tracks.slice(0, 3).map(track => track.artists[0].name);
    const spotifyUrlsReco = spotifyRecoData.tracks.slice(0, 3).map(track => track.external_urls.spotify);
    const spotifyRecoID = spotifyRecoData.tracks.slice(0, 2).map(track => track.id);

    let html = `
      <div class="track_none">
    <p style="text-align: center">Here are some recommendations for <strong>${spotifyGenreList[0]} / ${spotifyGenreList[1]}</strong> songs similar to <strong>${spotifyTrackName} by ${spotifyArtistName}</strong>:</p>
    <p><iframe class="spotify-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/${spotifyRecoID[0]}"
    width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></p>
    <p><iframe class="spotify-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/track/${spotifyRecoID[1]}"
    width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></p>
      </div>
    `;
    dataContainer.innerHTML = html;

  } catch (error) {
    console.error(error);
  }
}

getRecentTracks();
