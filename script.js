//You can edit ALL of the code here
let statusFlag = "loading";
let allEpisodes = [];

async function setup() {
    await getAllEpisodes();
  
  makePageForEpisodes(allEpisodes);
  
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
  inputEl.addEventListener("input", () => {
    const searchTerm = inputEl.value.toLowerCase();
    if (searchTerm !== '') {
      document.getElementById('select-el').value = 'all';
    }
    const selected = document.getElementById('selected');
    const filteredEpisodes = allEpisodes.filter((episode) => {
      return (
        episode.name.toLowerCase().includes(searchTerm) ||
        episode.summary.toLowerCase().includes(searchTerm)
      );
    });
    makePageForEpisodes(filteredEpisodes);
    displayEpisode(allEpisodes.length, filteredEpisodes.length);
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
        const image = (card.querySelector("img").src = episodeItem.image.medium);
        const summary = (card.querySelector("#summary").innerHTML =
          episodeItem.summary);
    
        const formattedseason = String(episodeItem.season).padStart(2, "0");
        const forEpisode = String(episodeItem.number).padStart(2, "0");
        const h3 = (card.querySelector(
          "h3"
        ).textContent = `${episodeItem.name} ~ S${formattedseason}E${forEpisode}`);
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
