import $ from 'jquery';
import OlcModeler from "./lib/olcmodeler/OlcModeler";
import PnModeler from "./lib/pnmodeler/PnModeler";

const olcModeler = new OlcModeler({
  container: document.querySelector('#olc-canvas'),
  keyboard: { 
    bindTo: document.querySelector('#olc-canvas') 
  }
});

const pnModeler = new PnModeler({
  container: document.querySelector('#pn-canvas'),
  keyboard: { 
    bindTo: document.querySelector('#pn-canvas') 
  }
});

async function createNewDiagram() {
  try {
    await olcModeler.createNew();
    await pnModeler.createNew();
  } catch (err) {
      console.error(err);
  }
}

$(function() {
  createNewDiagram();
});
