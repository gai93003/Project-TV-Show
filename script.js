//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  episodeList.forEach((episodeItem) => {
    const card = document.getElementById('film-card').content.cloneNode(true);
    const section = card.querySelector('section');
    const image = card.querySelector('img').src = episodeItem.image.medium;
    const summary = card.querySelector('#summary').innerHTML = episodeItem.summary;

    const formattedseason = String(episodeItem.season).padStart(2, '0');
    const forEpisode = String(episodeItem.number).padStart(2, '0');
    const h3 = card.querySelector('h3').textContent = `${episodeItem.name} ~ S${formattedseason}E${forEpisode}`;
    const link = card.querySelector('a');
    link.href = episodeItem.url

    console.log(formattedseason, forEpisode)
    // section.append(h3);
    card.appendChild(section)
    rootElem.append(card)
  });
}

window.onload = setup;
