//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  searchEpisodes();
  selectEpisode();
  makePageForEpisodes(allEpisodes);
}

const inputEl = document.getElementById("inputEl");

function searchEpisodes() {
  inputEl.addEventListener("input", () => {
    const searchTerm = inputEl.value.toLowerCase();
    console.log(inputEl.value);
    const allEpisodes = getAllEpisodes();
    //compare value to real data episode names and summary
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
  for(const episodeItem of episodeList) {
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

    //console.log(formattedseason, forEpisode)
    // section.append(h3);
    card.appendChild(section);
    rootElem.append(card);
  };
}
function selectEpisode() {
  const selectEl = document.getElementById("select-el");
  const allEpisodes = getAllEpisodes();

  allEpisodes.forEach (episode =>{

   
    const optionEl = document.createElement("option");

    const formattedseason = String(episode.season).padStart(2, "0");
    const forEpisode = String(episode.number).padStart(2, "0");
    optionEl.textContent = `S${formattedseason}E${forEpisode} - ${episode.name}`;
    optionEl.value = episode.id;
    selectEl.appendChild(optionEl);
  })
  selectEl.addEventListener("change", (ev) =>{
    if(ev.target.value === "all"){
      makePageForEpisodes(allEpisodes)
    } else{
      const pickedEpisode = allEpisodes.find(epsd => epsd.id == ev.target.value
      )
      makePageForEpisodes([pickedEpisode])
    }
  })
}

function displayEpisode(allEpisodes,pickedEpisode) {
  const paragraghEl = document.getElementById("display");
  paragraghEl.textContent = `Display ${pickedEpisode}/${allEpisodes}`
  
  
}
searchEpisodes();
window.onload = setup;
