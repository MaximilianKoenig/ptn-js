import $ from 'jquery';
import OlcModeler from "./lib/olcmodeler/OlcModeler";
import PnModeler from "./lib/pnmodeler/PnModeler";

import { upload, download } from "./lib/util/FileUtil";

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

document.getElementById('openButton').addEventListener('click', () => upload((data) => {
  importFromFile(data);
}));

document.getElementById('saveButton').addEventListener('click', () => exportXML().then(xml => {
  download('PetriNet.xml', xml);
}));

async function exportXML() {
  const pnXML = (await pnModeler.saveXML({format: true})).xml;
  console.log(pnXML);
  return pnXML;
}

async function importFromFile(file) {
  await pnModeler.importXML(file);
}

Array.from(document.getElementsByClassName("canvas")).forEach(element => {
  element.tabIndex = 0;
  element.addEventListener('mouseenter', event => {
    if (document.activeElement.className !== 'djs-direct-editing-content') {
      element.focus();
    }
  });
});

// Should be used once the olc modeler is gone
// const canvas = document.getElementById("pn-canvas")
// canvas.tabIndex = 0;
// canvas.addEventListener('mouseenter', event => {
//   if (document.activeElement.className !== 'djs-direct-editing-content') {
//     canvas.focus();
//   }
// });
