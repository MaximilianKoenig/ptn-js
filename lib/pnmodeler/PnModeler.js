import Diagram from "diagram-js";

// diagram-js modules
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll";
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";

import BendPointsModule from "diagram-js/lib/features/bendpoints";
import ConnectModule from "diagram-js/lib/features/connect";
import ConnectionPreviewModule from "diagram-js/lib/features/connection-preview";
import ContextPadModule from "diagram-js/lib/features/context-pad";
import CreateModule from "diagram-js/lib/features/create";
import EditorActionsModule from "../common/editor-actions";
import GridSnappingModule from "diagram-js/lib/features/grid-snapping";
import KeyboardMoveSelectionModule from "diagram-js/lib/features/keyboard-move-selection";
import LassoToolModule from "diagram-js/lib/features/lasso-tool";
import ModelingModule from "diagram-js/lib/features/modeling";
import MoveModule from "diagram-js/lib/features/move";
import OutlineModule from "diagram-js/lib/features/outline";
import PaletteModule from "diagram-js/lib/features/palette";
import ResizeModule from "diagram-js/lib/features/resize";
import RulesModule from "diagram-js/lib/features/rules";
import SearchPadModule from "../common/search";
import SelectionModule from "diagram-js/lib/features/selection";
import SnappingModule from "diagram-js/lib/features/snapping";
import TranslateModule from "diagram-js/lib/i18n/translate";

// Custom common Modules
import KeyboardModule from "../common/keyboard";
import CopyPasteModule from "../common/copy-paste";

// Modeler-specific modules
import PnPaletteModule from "./palette";
import PnCoreModule from "./core";
import PnModelingModule from "./modeling";
import PnRulesModule from "./rules";
import PnModdle from "./moddle";
import PnAutoPlaceModule from "./auto-place";
import { importPnDiagram } from "./import/Importer";
import {
  convertModdleXmlToPnmlXml,
  convertPnmlXmlToModdleXml,
} from "pnml-moddle-converter";

// Token replay modules
import ToggleSimulationModeModule from "../replay/toggle-simulation-mode";
import ContextPadsModule from "../replay/context-pads";
import SimulatorModule from "../replay/simulator";
import TokenSimulationPaletteModule from "../replay/palette";
import ResetSimulationModule from "../replay/reset-simulation";
import UndoModule from "../replay/undo";

const emptyDiagram = `<?xml version="1.0" encoding="UTF-8"?>
<ptn:definitions xmlns:ptn="http://bpt-lab.org/schemas/ptn" xmlns:ptnDi="http://bpt-lab.org/schemas/ptnDi" xmlns:dc="https://www.omg.org/spec/BPMN/20100501/DC.xsd">
    <ptn:ptNet id="ptNet_1" name="Place Transition Net 1">
    </ptn:ptNet>
    <ptnDi:ptnDiagram id="ptNet_1_di">
        <ptnDi:ptnPlane id="ptNet_1_plane" ptnElement="ptNet_1">
        </ptnDi:ptnPlane>
    </ptnDi:ptnDiagram>
</ptn:definitions>`;

export default class PnModeler extends Diagram {
  constructor(options) {
    const { container, additionalModules = [], keyboard } = options;

    const builtinModules = [
      ConnectModule,
      ConnectionPreviewModule,
      ContextPadModule,
      CreateModule,
      LassoToolModule,
      ModelingModule,
      MoveCanvasModule,
      MoveModule,
      OutlineModule,
      PaletteModule,
      RulesModule,
      SelectionModule,
      ZoomScrollModule,
      EditorActionsModule,
      KeyboardModule,
      CopyPasteModule,
      GridSnappingModule,
      BendPointsModule,
      ResizeModule,
      SnappingModule,
      KeyboardMoveSelectionModule,
      TranslateModule,
      SearchPadModule,
    ];

    const customModules = [
      PnPaletteModule,
      PnCoreModule,
      PnModelingModule,
      PnAutoPlaceModule,
      PnRulesModule,
      ToggleSimulationModeModule,
      SimulatorModule,
      ContextPadsModule,
      TokenSimulationPaletteModule,
      ResetSimulationModule,
      UndoModule,
      {
        moddle: ["value", new PnModdle({})],
      },
    ];

    const diagramOptions = {
      canvas: {
        container,
      },
      keyboard,
      modules: [...builtinModules, ...customModules, ...additionalModules],
    };

    super(diagramOptions);

    // Add pnModeler after calling super
    this.get("injector").invoke(function (injector) {
      injector.pnModeler = this;
    });

    this.get("eventBus").fire("attach"); // Needed for key listeners to work
  }
  
  createNew() {
    return this.importXML(emptyDiagram);
  }

  async importPNML(pnmlXml) {
    const moddleXml = convertPnmlXmlToModdleXml(pnmlXml);
    await this.importXML(moddleXml);
  }

  importXML(xml) {
    const self = this;

    return new Promise(function (resolve, reject) {
      // hook in pre-parse listeners +
      // allow xml manipulation
      xml = self._emit("import.parse.start", { xml: xml }) || xml;

      const moddle = self.get("moddle");

      moddle.ids.clear();

      moddle
        .fromXML(xml, "ptn:Definitions")
        .then(function (result) {
          let definitions = result.rootElement;
          const { references, warnings, elementsById } = result;

          const context = {
            references,
            elementsById,
            warnings,
          };

          definitions =
            self._emit("import.parse.complete", {
              definitions,
              context,
            }) || definitions;

          self.importDefinitions(definitions);
          self.collectIds(moddle, elementsById);

          self._emit("import.render.start", { definitions: definitions });
          self.showPn(definitions);
          self._emit("import.render.complete", {});

          self._emit("import.done", { error: null, warnings: null });
          resolve();
        })
        .catch(function (err) {
          self._emit("import.parse.failed", {
            error: err,
          });

          self._emit("import.done", { error: err, warnings: err.warnings });

          return reject(err);
        });
    });
  }

  importDefinitions(definitions, elementsById) {
    this._definitions = definitions;
  }

  collectIds(moddle, elementsById) {
    for (let id in elementsById) {
      moddle.ids.claim(id, elementsById[id]);
    }
  }

  showPn(definitions) {
    this.clear();

    // We currently assume that we only import single diagrams
    const rootDiagram = definitions.ptnDiagram;
    importPnDiagram(this, definitions, rootDiagram);
  }

  saveXML(options) {
    options = options || {};

    const self = this;

    let definitions = this._definitions;

    return new Promise(function (resolve, reject) {
      if (!definitions) {
        const err = new Error("no xml loaded");

        return reject(err);
      }

      // allow to fiddle around with definitions
      definitions =
        self._emit("saveXML.start", {
          definitions: definitions,
        }) || definitions;

      self
        .get("moddle")
        .toXML(definitions, options)
        .then(function (result) {
          let xml = result.xml;
          try {
            xml =
              self._emit("saveXML.serialized", {
                error: null,
                xml: xml,
              }) || xml;

            self._emit("saveXML.done", {
              error: null,
              xml: xml,
            });
          } catch (e) {
            console.error("error in saveXML life-cycle listener", e);
          }
          return resolve({ xml: xml });
        })
        .catch(function (err) {
          return reject(err);
        });
    });
  }

  async savePNML(options) {
    options = options || {};
    const moddleXml = (await this.saveXML(options)).xml;
    return convertModdleXmlToPnmlXml(moddleXml);
  }
  _emit(type, event) {
    return this.get("eventBus").fire(type, event);
  }
}
