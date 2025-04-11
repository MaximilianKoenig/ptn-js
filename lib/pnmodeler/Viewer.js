import { assign } from "min-dash";
import CustomCoreModule from "./core";
import TranslateModule from "diagram-js/lib/i18n/translate";
import SelectionModule from "diagram-js/lib/features/selection";
import OverlaysModule from "diagram-js/lib/features/overlays";

import BaseViewer from "./BaseViewer";

export default class Viewer extends BaseViewer {
  constructor(options) {
    const { modules = [] } = options;
    const viewerModules = [
      CustomCoreModule,
      TranslateModule,
      SelectionModule,
      OverlaysModule,
    ];
    const mergedModules = [...modules, ...viewerModules];

    const viewerOptions = assign({}, options, { modules: mergedModules });

    super(viewerOptions);
  }
}

/* ## Extending the Viewer
 *
 * In order to extend the viewer pass extension modules to bootstrap via the
 * `additionalModules` option. An extension module is an object that exposes
 * named services.
 *
 * The following example depicts the integration of a simple
 * logging component that integrates with interaction events:
 *
 *
 * ```javascript
 *
 * // logging component
 * function InteractionLogger(eventBus) {
 *   eventBus.on('element.hover', function(event) {
 *     console.log()
 *   })
 * }
 *
 * InteractionLogger.$inject = [ 'eventBus' ]; // minification save
 *
 * // extension module
 * var extensionModule = {
 *   __init__: [ 'interactionLogger' ],
 *   interactionLogger: [ 'type', InteractionLogger ]
 * };
 *
 * // extend the viewer
 * const extendedViewer = new Viewer({ additionalModules: [ extensionModule ] });
 * extendedViewer.importXML(...);
 * ```
 */
