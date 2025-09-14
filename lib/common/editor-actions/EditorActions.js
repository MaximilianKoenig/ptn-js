import inherits from "inherits";
import EditorActions from "diagram-js/lib/features/editor-actions/EditorActions";
import { getBBox } from "diagram-js/lib/util/Elements";

/**
 * Registers and executes common editor actions.
 *
 * @param {Injector} injector
 */
export default function CommonEditorActions(injector) {
  injector.invoke(EditorActions, this);
}

inherits(CommonEditorActions, EditorActions);

CommonEditorActions.$inject = ["injector"];

/**
 * Register default actions.
 *
 * @param {Injector} injector
 */
CommonEditorActions.prototype._registerDefaultActions = function (injector) {
  // (0) invoke super method

  EditorActions.prototype._registerDefaultActions.call(this, injector);

  // (1) retrieve optional components to integrate with

  const canvas = injector.get("canvas", false);
  const elementRegistry = injector.get("elementRegistry", false);
  const selection = injector.get("selection", false);
  const spaceTool = injector.get("spaceTool", false);
  const lassoTool = injector.get("lassoTool", false);
  const handTool = injector.get("handTool", false);
  const globalConnect = injector.get("globalConnect", false);
  const distributeElements = injector.get("distributeElements", false);
  const alignElements = injector.get("alignElements", false);
  const directEditing = injector.get("directEditing", false);
  const searchPad = injector.get("searchPad", false);
  const modeling = injector.get("modeling", false);

  // (2) check components and register actions

  if (canvas && elementRegistry && selection) {
    this._registerAction("selectElements", function () {
      // select all elements except for the invisible
      // root element
      const rootElement = canvas.getRootElement();
      const elements = elementRegistry.filter(function (element) {
        return element !== rootElement;
      });

      selection.select(elements);
      return elements;
    });
  }

  if (spaceTool) {
    this._registerAction("spaceTool", function () {
      spaceTool.toggle();
    });
  }

  if (lassoTool) {
    this._registerAction("lassoTool", function () {
      lassoTool.toggle();
    });
  }

  if (handTool) {
    this._registerAction("handTool", function () {
      handTool.toggle();
    });
  }

  if (globalConnect) {
    this._registerAction("globalConnectTool", function () {
      globalConnect.toggle();
    });
  }

  if (selection && distributeElements) {
    this._registerAction("distributeElements", function (opts) {
      const currentSelection = selection.get();
      const type = opts.type;

      if (currentSelection.length) {
        distributeElements.trigger(currentSelection, type);
      }
    });
  }

  if (selection && alignElements) {
    this._registerAction("alignElements", function (opts) {
      const currentSelection = selection.get();
      const type = opts.type;

      if (currentSelection.length) {
        alignElements.trigger(currentSelection, type);
      }
    });
  }

  if (selection && directEditing) {
    this._registerAction("directEditing", function () {
      const currentSelection = selection.get();

      if (currentSelection.length) {
        directEditing.activate(currentSelection[0]);
      }
    });
  }

  if (searchPad) {
    this._registerAction("find", function () {
      searchPad.toggle();
    });
  }

  if (canvas && modeling) {
    this._registerAction("moveToOrigin", function () {
      const rootElement = canvas.getRootElement();
      const elements = elementRegistry.filter(function (element) {
        return element !== rootElement;
      });
      const boundingBox = getBBox(elements);

      modeling.moveElements(
        elements,
        { x: -boundingBox.x, y: -boundingBox.y },
        rootElement,
      );
    });
  }
};
