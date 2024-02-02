import OlcModeler from "./lib/olcmodeler/OlcModeler";
import $ from 'jquery';

const olcModeler = new OlcModeler({
    container: document.querySelector('#olc-canvas'),
    keyboard: { 
      bindTo: document.querySelector('#olc-canvas') 
    }
});

async function createNewDiagram() {
    try {
      await olcModeler.createNew();
    } catch (err) {
        console.error(err);
    }
}

$(function() {
    createNewDiagram();
});
