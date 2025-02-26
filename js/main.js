// main.js
import { Model } from "./model.js";
import { ListView } from "./listview.js";
import { ArticleView } from "./articleview.js";
import { TagController } from "./tagController.js";
import { ListController } from "./listcontroller.js";
import { ArticleController } from "./articlecontroller.js";

document.addEventListener("DOMContentLoaded", () => {
    // Observer als Funktion
    const model = new Model();
    model.addObserver((eventName, data) => {
        if (eventName === "dataLoaded") {
            console.log("Daten wurden geladen:", data);
        }
        if (eventName === "tagsUpdated") {
            console.log("Tags wurden aktualisiert:", data.tags);
        }
    });

    const listView = new ListView(model);
    const articleView = new ArticleView();

    new ListController(model, listView);
    new ArticleController(model, articleView, listView);
    new TagController(model); // TagController initialisiert auch die TagView

    document.addEventListener("dataLoaded", () => {
        listView.renderLists(model.lists);
        articleView.renderItemsInModal(model.items);
    });

    listView.showListOverview();
});

/**
 * CSS
 * Fügt einen sanften Scroll-Effekt hinzu,
 * um bei einer Mausbewegung das Scrollen nach unten flüssig zu machen.
 */
let lastScrollPosition = 0;

window.addEventListener('wheel', function (event) {
    const isOnTopScreen = window.scrollY < window.innerHeight;
    const isScrollingDown = lastScrollPosition < window.scrollY;
    if (isOnTopScreen && isScrollingDown) {
        event.preventDefault();
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
    lastScrollPosition = window.scrollY;
}, { passive: false });

document.querySelector('.start').addEventListener('click', function () {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
});