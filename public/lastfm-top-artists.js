fetch('/.netlify/functions/getTopArtists')
  .then(response => response.json())
  .then(async data => {
    const dataContainer = document.querySelector('.js-lastfm-top-artists');
    const topArtists = data.topartists.artist.slice(0, 6);

    // Create an array of promises for each artist's data
    const artistPromises = topArtists.map(artist => {
      return fetch(`/.netlify/functions/getArtistInfo?artist=${artist.name}`)
        .then(response => response.json())
        .then(async data => {
          // Check for error property in Last.fm API response
          if (typeof data.artist.tags.tag[1] === 'undefined') {
            return {
              summary: 'Last.fm unfortunately does not have any additional information on this artist.',
            };
          }

          // Return the data if it exists
          const albumResults = await fetch(`/.netlify/functions/getTopAlbumsByArtist?artist=${artist.name}`);
          const albumData = await albumResults.json();

          const bioSentences = data.artist.bio.summary.split('. ');
          const bio = bioSentences[0] + '.'; // Get the first sentence of the bio

          return {
            tags: data.artist.tags.tag
              .filter(tag => tag.name !== "seen live")
              .slice(0, 3),
            similarArtist: data.artist.similar.artist.slice(0,3),
            topAlbums: albumData.topalbums.album.slice(0, 2),
            bio: bio
          };
        })
        .catch(error => {
          console.error(error);
          return null;
        });
    });

    // Resolve all artist promises and create HTML
    Promise.all(artistPromises)
      .then(async artists => {
        const html = await Promise.all(topArtists.map(async (artist, i) => {


          const q = `${artist.name}`;
          const spotifyResponse = await fetch(`/.netlify/functions/getSpotifyArtist?q=${encodeURIComponent(q)}`);
          const spotifyData = await spotifyResponse.json();
          const spotifyArtistID = spotifyData.artists.items[0].id;
          const spotifyArtistImgUrl = spotifyData.artists.items[0].images[1].url;
          const spotifyGenres = spotifyData.artists.items[0].genres.slice(0, 2);

          if (artists[i].summary) {
            return `
              <li class="track_ul">
                  <strong><a href="${artist.url}" target="_blank">${artist.name}</a></strong> (${artist.playcount} plays)
                  <br>${artists[i].summary}
              </li>
            `;
          } else {
            return `
              <li class="track_ul">
                  <img src="${spotifyArtistImgUrl}">
                  <div class="no-wrap-text">
                    <strong><a href="${artist.url}" target="_blank" class="track_link">${artist.name}</a></strong> (${artist.playcount} plays).
                    <br>${artists[i].bio}
                    <br><strong>Genres:</strong> ${artists[i].tags[0].name} and ${artists[i].tags[1].name}. 
                    <br><strong>Most popular albums:</strong> <a href="${artists[i].topAlbums[0].url}" target="_blank">${artists[i].topAlbums[0].name}</a> and <a href="${artists[i].topAlbums[1].url}" target="_blank">${artists[i].topAlbums[1].name}</a>.
                    <br><strong>Similar artists:</strong> <a href="${artists[i].similarArtist[0].url}" target="_blank"">${artists[i].similarArtist[0].name}</a>, <a href="${artists[i].similarArtist[1].url}" target="_blank"">${artists[i].similarArtist[1].name}</a>, and <a href="${artists[i].similarArtist[2].url}" target="_blank">${artists[i].similarArtist[2].name}</a>.
                  </div>
                  </li>
            `;
          }
        }));
        dataContainer.innerHTML = `<ol>${html.join('')}</ol>`;
      })
      .catch(error => console.error(error));

  })
  .catch(error => console.error(error));

