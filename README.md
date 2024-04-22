# ptn-js

Petri net modeling tool for viewing and editing Petri nets in the browser. Supports the import and export of .pnml files according to the [PNML standard](https://www.pnml.org/). Currently, only place transition nets are supported.

The tool is based on [diagram-js](https://github.com/bpmn-io/diagram-js) and took inspiration from [bpmn-js](https://github.com/bpmn-io/bpmn-js) and [fcm-js](https://github.com/bptlab/fCM-design-support).

## Usage

The modeler is available as an npm package.
If you want to embed the modeler into your project, install the package as a dependency to your node project using:

```bash
npm i --save ptn-js
```

To integrate the modeler, create a ptn-js instance, bind it to the canvas, and import a model or create a new one.

```javascript
import PnModeler from 'ptn-js/lib/Modeler';
import "ptn-js/assets/pn-js.css";

const xml = '...'; // your Petri net XML
const canvas = '...'; // the HTML element the modeler should use as canvas
const modeler = new PnModeler({
  container: canvas,
  keyboard: [
    bindTo: canvas
  ]
});

await modeler.importXML(xml);
// await modeler.createNew(); Alternatively, this creates an empty diagram
// await modeler.importPNML(pnml); Or you can import a .pnml file

const xmlExport = (await modeler.saveXML()).xml;
const pnmlExport = await modeler.savePNML();
```

An example can be found [here](https://github.com/MaximilianKoenig/ptn-js-demo).
