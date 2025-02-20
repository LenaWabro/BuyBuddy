import { Model } from "./model.js";
import { ListView } from "./listview.js";
import { ArtikelView } from "./articleview.js";
import { ListController } from "./listcontroller.js";
import { ArtikelController } from "./articlecontroller.js";
import { User } from "./user.js";
import { UserController } from "./usercontroller.js";

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


// Scroll-Event
window.addEventListener('wheel', function (event) {
    if (window.scrollY === 0) {
        event.preventDefault();
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
}, { passive: false });


// Klick-Event auf .start
document.querySelector('.start').addEventListener('click', function () {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
});






