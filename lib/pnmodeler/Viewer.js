import { assign } from "min-dash";

import CustomCoreModule from "./core";
import TranslateModule from "diagram-js/lib/i18n/translate";
import SelectionModule from "diagram-js/lib/features/selection";
import OverlaysModule from "diagram-js/lib/features/overlays";

import BaseViewer from "./BaseViewer";

export default class Viewer extends BaseViewer {
  constructor(options) {
    const { container, additionalModules = [], moddleExtensions = {} } = options;

    const viewerModules = [
      CustomCoreModule,
      TranslateModule,
      SelectionModule,
      OverlaysModule,
    ];

    const viewerModdleExtensions = {};

    const viewerOptions = {
      container,
      modules: [...viewerModules, ...additionalModules],
      // Overwrite default viewer moddle extensions with those passed in the options
      moddleExtensions: assign({}, viewerModdleExtensions, moddleExtensions),
    };

    super(viewerOptions);
  }
}
