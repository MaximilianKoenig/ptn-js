import { assign } from "min-dash";
import { is } from "../util/Util";
import { MODELER_PREFIX } from "../util/constants";

// In the context pad provider, the actions available in the context menu when selecting an element are defined.
export default class CustomContextPadProvider {
  constructor(
    connect,
    contextPad,
    modeling,
    elementFactory,
    create,
    autoPlace,
    popupMenu,
    canvas,
  ) {
    this._connect = connect;
    this._modeling = modeling;
    this._elementFactory = elementFactory;
    this._create = create;
    this._autoPlace = autoPlace;
    this._popupMenu = popupMenu;
    this._canvas = canvas;

    contextPad.registerProvider(this);
  }

  getContextPadEntries(element) {
    const connect = this._connect;
    const modeling = this._modeling;
    const elementFactory = this._elementFactory;
    const create = this._create;
    const autoPlace = this._autoPlace;
    const popupMenu = this._popupMenu;
    const canvas = this._canvas;

    function removeElement() {
      modeling.removeElements([element]);
    }

    // CustomModelerTodo: Define functions for all entries in the context pad of an element.
    // For example, creating and appending new model elements.
    function startConnect(event, element, autoActivate) {
      connect.start(event, element, autoActivate);
    }

    function appendPlace(event, element) {
      const shape = elementFactory.createShape({
        type: `${MODELER_PREFIX}:Place`,
      });

      autoPlace.append(element, shape, {
        connection: { type: `${MODELER_PREFIX}:Arc` },
      });
    }

    function appendPlaceStart(event) {
      const shape = elementFactory.createShape({
        type: `${MODELER_PREFIX}:Place`,
      });

      create.start(event, shape, { source: element });
    }

    function appendTransition(event, element) {
      const shape = elementFactory.createShape({
        type: `${MODELER_PREFIX}:Transition`,
      });

      autoPlace.append(element, shape, {
        connection: { type: `${MODELER_PREFIX}:Arc` },
      });
    }

    function appendSilentTransition(event, element) {
      const shape = elementFactory.createShape({
        type: `${MODELER_PREFIX}:Transition`,
        isSilent: true,
      });

      autoPlace.append(element, shape, {
        connection: { type: `${MODELER_PREFIX}:Arc` },
      });
    }

    function appendTransitionStart(event) {
      const shape = elementFactory.createShape({
        type: `${MODELER_PREFIX}:Transition`,
      });

      create.start(event, shape, { source: element });
    }

    function appendSilentTransitionStart(event) {
      const shape = elementFactory.createShape({
        type: `${MODELER_PREFIX}:Transition`,
        isSilent: true,
      });

      create.start(event, shape, { source: element });
    }

    function addToken(event, element) {
      const marking = element.businessObject.initialMarking;
      if (marking) {
        updateMarking(element, marking + 1);
      } else {
        updateMarking(element, 1);
      }
    }

    function removeToken(event, element) {
      const marking = element.businessObject.initialMarking;
      if (marking && marking > 0) {
        updateMarking(element, marking - 1);
      }
    }

    function updateMarking(element, newMarking) {
      modeling.updateProperty(element, "initialMarking", newMarking, {
        rerender: true,
      });
    }

    function getPopupMenuPosition() {
      const Y_OFFSET = 5;
      const pad = canvas.getContainer().querySelector(".djs-context-pad");
      const padRect = pad.getBoundingClientRect();
      const pos = {
        x: padRect.left,
        y: padRect.bottom + Y_OFFSET,
      };

      return pos;
    }

    const actions = {};

    // CustomModelerTodo: Define the context menu entries for each element type.
    // "group" is the row in which the action will be displayed. Within a row, elements are in the same order as they are assigned to the actions object.
    // "className" is the icon to be displayed.
    // "title" is the tooltip to be displayed.

    // Transition actions
    if (is(element, `${MODELER_PREFIX}:Transition`)) {
      assign(actions, {
        "append-place": {
          group: "row_1",
          className: "pn-icon-place",
          title: "Append place",
          action: {
            click: appendPlace,
            dragstart: appendPlaceStart,
          },
        },
      });

      assign(actions, {
        "change-transition-type": {
          group: "row_1",
          className: "bpmn-icon-screw-wrench",
          title: "Change transition type",
          action: {
            click: function (event, element) {
              const position = assign(getPopupMenuPosition(), {
                cursor: { x: event.x, y: event.y },
              });

              popupMenu.open(element, "replace-transition", position, {
                title: "Change Transition Type",
                width: 300,
              });
            },
          },
        },
      });

      assign(actions, {
        connect: {
          group: "row_2",
          className: "bpmn-icon-connection",
          title: "Connect",
          action: {
            click: startConnect,
            dragstart: startConnect,
          },
        },
      });
    }

    // Place actions
    if (is(element, `${MODELER_PREFIX}:Place`)) {
      assign(actions, {
        "append-transition": {
          group: "row_1",
          className: "pn-icon-transition",
          title: "Append transition",
          action: {
            click: appendTransition,
            dragstart: appendTransitionStart,
          },
        },
      });

      assign(actions, {
        "append-silent-transition": {
          group: "row_2",
          className: "pn-icon-silent-transition",
          title: "Append silent transition",
          action: {
            click: appendSilentTransition,
            dragstart: appendSilentTransitionStart,
          },
        },
      });

      assign(actions, {
        connect: {
          group: "row_3",
          className: "bpmn-icon-connection",
          title: "Connect",
          action: {
            click: startConnect,
            dragstart: startConnect,
          },
        },
      });

      assign(actions, {
        "add-token": {
          group: "row_1",
          className: "pn-icon-add-token",
          title: "Add token",
          action: {
            click: addToken,
          },
        },
      });

      assign(actions, {
        "remove-token": {
          group: "row_2",
          className: "pn-icon-remove-token",
          title: "Remove token",
          action: {
            click: removeToken,
          },
        },
      });
    }

    // Common actions
    assign(actions, {
      delete: {
        group: "row_3",
        className: "bpmn-icon-trash",
        title: "Remove",
        action: {
          click: removeElement,
          dragstart: removeElement,
        },
      },
    });
    return actions;
  }
}

CustomContextPadProvider.$inject = [
  "connect",
  "contextPad",
  "modeling",
  "elementFactory",
  "create",
  "autoPlace",
  "popupMenu",
  "canvas",
];
