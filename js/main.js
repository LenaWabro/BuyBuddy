import { Model } from "./model.js";
import { ListView } from "./listview.js";
import { ArtikelView } from "./articleview.js";
import { ListController } from "./listcontroller.js";
import { ArtikelController } from "./articlecontroller.js";


let lastScrollPosition = 0;

document.addEventListener("DOMContentLoaded", () => {
    const model = new Model();
    const listView = new ListView(model); // <-- Model hier übergeben
    const artikelView = new ArtikelView();

    new ListController(model, listView);
    new ArtikelController(model, artikelView, listView);

    document.addEventListener("dataLoaded", () => {
        listView.renderLists(model.lists);
        artikelView.renderItemsInModal(model.items);
    });

    listView.showListOverview();
});

//für CSS Effekt
// Scroll-Event
window.addEventListener('wheel', function (event) {
    const isOnTopScreen = window.scrollY < window.innerHeight;
    const isScrollingDown = lastScrollPosition<window.scrollY;
    if (isOnTopScreen && isScrollingDown) {
        event.preventDefault();
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
    lastScrollPosition=window.scrollY;
}, { passive: false });


// Klick-Event auf .start
document.querySelector('.start').addEventListener('click', function () {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
});