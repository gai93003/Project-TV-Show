//store fetched data to avoid redundant requests
let statusFlag = "loading";
let allEpisodes = [];
let allShows = [];
const showCache = {}; //cache for shows and the episodes
const allShowsContainer = document.getElementById("all-shows");
const showSelectEl = document.getElementById('show-dropdown');

async function setup() {
  await getAllShows(); // Fetch and populate shows
  populateShowSelector();
  await searchAvailableShows();
  setupShowSearch();
  searchEpisodes(); // Call search function after episodes are loaded
}

//fetch all shows
async function getAllShows() {
  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    const data = await response.json();
    allShows = data.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
    statusFlag = "success";
  } catch {
    statusFlag = "error";
  }
}

//fetch episodes for a specific show
async function fetchEpisodesForShow(showId) {
  if (showCache[showId]) {
    console.log(`Using cached episodes for show ID: ${showId}`);
    allEpisodes = showCache[showId];
  } else {
    try {
      console.log(`Fetching episodes for show ID: ${showId}`);
      const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
      const data = await response.json();
      showCache[showId] = data; // Store in cache
      allEpisodes = data;
      console.log(`Fetched episodes:`, allEpisodes);
      statusFlag = "success";
    } catch (error) {
      console.error("Error fetching episodes:", error);
      statusFlag = "error";
    }
  }
}


function setupShowSearch() {
  const searchInput = document.createElement("input");
  searchInput.placeholder = "Search shows...";
  searchInput.id = "show-search";
  document.getElementById("input-div").prepend(searchInput); //Moved outside "all-shows"

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const showsContainer = document.getElementById("all-shows");

    
    showsContainer.innerHTML = '';
    const filteredShows = allShows.filter(show =>
      show.name.toLowerCase().includes(term) ||
      show.genres.some(genre => genre.toLowerCase().includes(term)) ||
      show.summary.toLowerCase().includes(term)
    );

    if (filteredShows.length === 0) {
      document.getElementById("all-shows").innerHTML = "<p>No matching shows.</p>";
    } else {
      searchAvailableShows(filteredShows);
    }
  });
}


//populate the show selector dropdown
function populateShowSelector() {

  const defaultOpt = document.createElement("option");
  defaultOpt.textContent = "Select a show";
  defaultOpt.value = "all";
  showSelectEl.appendChild(defaultOpt);

  allShows.forEach((show) => {
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
  selectEl.innerHTML =
    '<option value="all" id="selected">Select one episode...</option>';

  allEpisodes.forEach((episode) => {
    const optionEl = document.createElement("option");

    const formattedseason = String(episode.season).padStart(2, "0");
    const forEpisode = String(episode.number).padStart(2, "0");
    optionEl.textContent = `S${formattedseason}E${forEpisode} - ${episode.name}`;
    optionEl.value = episode.id;
    selectEl.appendChild(optionEl);
  });

  selectEl.addEventListener("change", (ev) => {
    document.getElementById("inputEl").value = "";
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
  const inputEl = document.getElementById("inputEl");
  const backBtn = document.createElement('button');
  backBtn.textContent = 'Back to Shows';
  backBtn.id = 'back-btn';
  backBtn.style.display = 'none';
  document.body.prepend(backBtn);

  backBtn.addEventListener("click", () => {
    document.getElementById("all-shows").style.display = "block";
    document.getElementById("all-episodes").style.display = "none";
    document.getElementById("input-div").style.display = "flex";
    backBtn.style.display = "none";
  });

  inputEl.addEventListener("input", () => {
    const searchTerm = inputEl.value.toLowerCase();
    if (searchTerm !== "") {
      document.getElementById("select-el").value = "all"; // Reset episode selection when searching
    }

    const filteredEpisodes = allEpisodes.filter((episode) => {
      return (
        episode.name.toLowerCase().includes(searchTerm) ||
        episode.summary.toLowerCase().includes(searchTerm)
      );
    });

    // Handle case where no episodes match the search term
    if (filteredEpisodes.length === 0) {
      document.getElementById("all-episodes").innerHTML =
        "<p>No episodes found matching your search.</p>";
    } else {
      makePageForEpisodes(filteredEpisodes); // Update the page with filtered episodes
      displayEpisode(allEpisodes.length, filteredEpisodes.length); // Display updated count
    }
  });
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("all-episodes");
  rootElem.innerHTML = "";

  if (statusFlag === "loading") {
    rootElem.innerHTML = "<p>Please wait, loading data...</p>";
  } else if (statusFlag === "success") {
    for (const episodeItem of episodeList) {
      const card = document.getElementById("film-card").content.cloneNode(true);
      const section = card.querySelector("section");

      // Check if image exists, if not, set a default image or leave empty
      const image = card.querySelector("img");
      if (episodeItem.image) {
        image.src = episodeItem.image.medium;
      } else {
        image.style.display = "none"; // Hide the image if it's missing
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
  } else {
    rootElem.innerHTML = "<p>Oops, something went wrong. Please try again.</p>";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });  
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
    document.getElementById("inputEl").value = "";
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

function searchAvailableShows(showsToDisplay = allShows) { // Default to allShows if no filter
  const showContainer = document.getElementById("all-shows");
  showContainer.innerHTML = ""; // Clear previous shows

  showsToDisplay.forEach(show => {
    const section = document.createElement('section');
    section.classList.add('show-details');

    const summaryAndImage = document.createElement('div');
    summaryAndImage.classList.add('summary-image')

    const h2 = document.createElement('h2');
    h2.classList.add('show-title');
    h2.textContent = show.name;

    const image = document.createElement('img');
    image.src = show.image?.medium || "default-image.jpg"; // Default image if missing
    image.classList.add('image')

    const summary = document.createElement('p');
    summary.innerHTML = show.summary;
    summary.classList.add('summary');

    const aside = document.createElement('aside');
    aside.classList.add('aside-details');

    const genres = document.createElement('p');
    genres.innerHTML = `<strong>Genre:</strong> ${show.genres.join(', ')}`; // Fixed genre format
    const status = document.createElement('p');
    status.innerHTML = `<strong>Status:</strong> ${show.status}`;
    const ratings = document.createElement('p');
    ratings.innerHTML = `<strong>Ratings:</strong> ${show.rating.average}`;
    const runtime = document.createElement('p');
    runtime.innerHTML = `<strong>Runtime:</strong> ${show.runtime}`;

    h2.addEventListener("click", async () => {
      await fetchEpisodesForShow(show.id);
      makePageForEpisodes(allEpisodes);

      showSelectEl.value = show.id;
      showSelectEl.dispatchEvent(new Event("change"));

      allShowsContainer.style.display = "none";
      document.getElementById("input-div").style.display = "flex";
      document.getElementById("all-episodes").style.display = "grid";
      document.getElementById("input-div").style.display = "flex";
      document.getElementById("back-btn").style.display = "block";

      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    aside.appendChild(genres);
    aside.appendChild(status);
    aside.appendChild(ratings);
    aside.appendChild(runtime);
    section.appendChild(h2);
    summaryAndImage.appendChild(image);
    summaryAndImage.appendChild(summary);
    summaryAndImage.appendChild(aside);
    section.appendChild(summaryAndImage);
    showContainer.appendChild(section);
  });
}


window.onload = setup;
