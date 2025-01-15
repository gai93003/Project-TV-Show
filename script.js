//You can edit ALL of the code here

//store fetched data to avoid redundant requests
let statusFlag = "loading";
let allEpisodes = [];
let allShows = [];
const showCache = {}; //cache for shows and theie episodes

async function setup() {
  await getAllShows(); // Fetch and populate shows
    populateShowSelector();
    //load the first show by default
    const firstShowId = allShows[0].id;
    await fetchEpisodesForShow(firstShowId);

  makePageForEpisodes(allEpisodes);
  searchEpisodes(); // Call search function after episodes are loaded
  
}

//fetch all shows
async function getAllShows(){
  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    const data = await response.json();
    allShows = data.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    statusFlag = "success";
  } catch {
    statusFlag = "error";
  }
}

//fetch episodes for a specific show
async function fetchEpisodesForShow(showId) {
  if (showCache[showId]) {
      allEpisodes = showCache[showId];
  } else {
      try {
          const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
          const data = await response.json();
          showCache[showId] = data;
          allEpisodes = data;
          statusFlag = "success";
      } catch {
          statusFlag = "error";
      }
  }
}

//populate the show selector dropdown
function populateShowSelector() {
  const showSelectEl = document.createElement("select");
  showSelectEl.id = "show-select";

  allShows.forEach(show => {
      const option = document.createElement("option");
      option.value = show.id;
      option.textContent = show.name;
      showSelectEl.appendChild(option);
  });

  document.getElementById("input-div").prepend(showSelectEl);

  showSelectEl.addEventListener("change", async (event) => {
      const selectedShowId = event.target.value;
      await fetchEpisodesForShow(selectedShowId);
      makePageForEpisodes(allEpisodes);
      updateEpisodeSelector();
  });
}

//update the episode selector dropdown
function updateEpisodeSelector() {
  const selectEl = document.getElementById("select-el");
  selectEl.innerHTML = "<option value=\"all\" id=\"selected\">Select one episode...</option>";

  allEpisodes.forEach(episode => {
      const optionEl = document.createElement("option");

      const formattedseason = String(episode.season).padStart(2, "0");
      const forEpisode = String(episode.number).padStart(2, "0");
      optionEl.textContent = `S${formattedseason}E${forEpisode} - ${episode.name}`;
      optionEl.value = episode.id;
      selectEl.appendChild(optionEl);
  });

  selectEl.addEventListener("change", (ev) => {
      document.getElementById('inputEl').value = '';
      if (ev.target.value === "all") {
          makePageForEpisodes(allEpisodes);
      } else {
          const pickedEpisode = allEpisodes.find(epsd => epsd.id == ev.target.value);
          makePageForEpisodes([pickedEpisode]);
          displayEpisode(allEpisodes.length, 1);
      }
  });
}

async function getAllEpisodes() {
  try {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
    const data = await response.json();

    allEpisodes = data;
    statusFlag = "success";
  } catch {
    statusFlag = "error";
  }

  searchEpisodes();
  selectEpisode();
  makePageForEpisodes(allEpisodes);
}

function searchEpisodes() {
  const inputEl = document.getElementById("inputEl")
  
  inputEl.addEventListener("input", () => {
    const searchTerm = inputEl.value.toLowerCase();
    if (searchTerm !== '') {
      document.getElementById('select-el').value = 'all';// Reset episode selection when searching
    }
    
    const filteredEpisodes = allEpisodes.filter((episode) => {
      return (
        episode.name.toLowerCase().includes(searchTerm) ||
        episode.summary.toLowerCase().includes(searchTerm)
      );
    });
    // Handle case where no episodes match the search term
    if(filteredEpisodes.length === 0){
      document.getElementById("all-episodes").innerHTML = "<p>No episodes found matching your search.</p>";
    } else {
      makePageForEpisodes(filteredEpisodes);// Update the page with filtered episodes
      displayEpisode(allEpisodes.length, filteredEpisodes.length); // Display updated count
    }
    
  });
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("all-episodes");
  rootElem.innerHTML = "";

    if(statusFlag === 'loading') {
      rootElem.innerHTML = '<p>Please wait, loading data...</p>'
    }
    else if (statusFlag === 'success') {
      for (const episodeItem of episodeList) {
        const card = document.getElementById("film-card").content.cloneNode(true);
        const section = card.querySelector("section");

      // Check if image exists, if not, set a default image or leave empty
        const image = card.querySelector("img");
        if(episodeItem.image){
          image.src = episodeItem.image.medium;
        } else {
          image.style.display = 'none';  // Hide the image if it's missing
        }
        
        const summary = card.querySelector("#summary");
        summary.innerHTML = episodeItem.summary || "No summary available.";
    
        const formattedseason = String(episodeItem.season).padStart(2, "0");
        const forEpisode = String(episodeItem.number).padStart(2, "0");
        const h3 = card.querySelector("h3");
        h3.textContent = `${episodeItem.name} ~ S${formattedseason}E${forEpisode}`;
        const link = card.querySelector("a");
        link.href = episodeItem.url;
    
        card.appendChild(section);
        rootElem.append(card);
      }         
    }
    else {
      rootElem.innerHTML = '<p>Oops, something went wrong. Please try again.</p>'
    }

}

function selectEpisode() {
  const selectEl = document.getElementById("select-el");

  allEpisodes.forEach((episode) => {
    const optionEl = document.createElement("option");

    const formattedseason = String(episode.season).padStart(2, "0");
    const forEpisode = String(episode.number).padStart(2, "0");
    optionEl.textContent = `S${formattedseason}E${forEpisode} - ${episode.name}`;
    optionEl.value = episode.id;
    selectEl.appendChild(optionEl);
  });
  selectEl.addEventListener("change", (ev) => {
    document.getElementById('inputEl').value = '';
    if (ev.target.value === "all") {
      makePageForEpisodes(allEpisodes);
    } else {
      const pickedEpisode = allEpisodes.find(
        (epsd) => epsd.id == ev.target.value
      );
      makePageForEpisodes([pickedEpisode]);
      displayEpisode(allEpisodes.length, 1);

    }
  });
}

function displayEpisode(allEpisodes, pickedEpisode) {
  const paragraghEl = document.getElementById("display");
  paragraghEl.textContent = `Display ${pickedEpisode}/${allEpisodes}`;
}

window.onload = setup;
