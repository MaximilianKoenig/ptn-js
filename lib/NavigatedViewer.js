import { assign } from "min-dash";
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll";

import Viewer from "./Viewer";

export default class NavigatedViewer extends Viewer {
  constructor(options) {
    const navigationModules = [MoveCanvasModule, ZoomScrollModule];

    const navigatedViewerOptions = assign({}, options, {
      modules: navigationModules,
    });

    super(navigatedViewerOptions);
  }
}
