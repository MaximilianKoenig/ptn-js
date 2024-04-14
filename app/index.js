import $ from 'jquery';
import PnModeler from "./lib/pnmodeler/PnModeler";

import { upload, download } from "./lib/util/FileUtil";

const pnModeler = new PnModeler({
  container: document.querySelector('#pn-canvas'),
  keyboard: { 
    bindTo: document.querySelector('#pn-canvas') 
  }
});

async function createNewDiagram() {
  try {
    await pnModeler.createNew();
  } catch (err) {
      console.error(err);
  }
}

$(function() {
  createNewDiagram();
});

document.getElementById('openXmlButton').addEventListener('click', () => upload((data) => {
  importFromXmlFile(data);
}));

document.getElementById('openPnmlButton').addEventListener('click', () => upload((data) => {
  importFromPnmlFile(data);
}));

document.getElementById('saveXmlButton').addEventListener('click', () => exportXML());

document.getElementById('savePnmlButton').addEventListener('click', () => exportPNML());

async function exportXML() {
  const pnXML = (await pnModeler.saveXML({format: true})).xml;
  console.log(pnXML);
  return pnXML;
}

async function exportPNML() {
  const pnml = (await pnModeler.savePNML({format: true})).xml;
  console.log(pnml);
  return pnml;
}

async function importFromXmlFile(file) {
  await pnModeler.importXML(file);
}

async function importFromPnmlFile(file) {
  await pnModeler.importPNML(file);
}

const canvas = document.getElementById("pn-canvas")
canvas.tabIndex = 0;
canvas.addEventListener('mouseenter', event => {
  if (document.activeElement.className !== 'djs-direct-editing-content') {
    canvas.focus();
  }
});
