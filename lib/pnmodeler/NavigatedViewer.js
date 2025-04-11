import { assign } from "min-dash";

import KeyboardMoveSelectionModule from "diagram-js/lib/features/keyboard-move-selection";
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll";

import Viewer from "./Viewer";

export default class NavigatedViewer extends Viewer {
  constructor(options) {
    const { container, additionalModules = [], moddleExtensions = {} } = options;

    const navigationModules = [
      KeyboardMoveSelectionModule,
      MoveCanvasModule,
      ZoomScrollModule,
    ];

    const navigatedViewerModdleExtensions = {};

    const navigatedViewerOptions = {
      container,
      modules: [...navigationModules, ...additionalModules],
      // Overwrite default navigatedViewer moddle extensions with those passed in the options
      moddleExtensions: assign({}, navigatedViewerModdleExtensions, moddleExtensions),
    };

    super(navigatedViewerOptions);
  }
}
