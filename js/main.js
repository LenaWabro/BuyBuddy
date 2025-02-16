import { Model } from "./model.js";
import { ListView } from "./listview.js";
import { ArtikelView } from "./articleview.js";
import { ListController } from "./listcontroller.js";
import { ArtikelController } from "./articlecontroller.js";

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
