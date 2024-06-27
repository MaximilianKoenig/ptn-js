import { assign } from "min-dash";
import { root } from "../../util/Util";

export default function PnContextPadProvider(
  connect,
  contextPad,
  modeling,
  elementFactory,
  create,
  autoPlace,
) {
  this._connect = connect;
  this._modeling = modeling;
  this._elementFactory = elementFactory;
  this._create = create;
  this._autoPlace = autoPlace;

  contextPad.registerProvider(this);
}

PnContextPadProvider.$inject = [
  "connect",
  "contextPad",
  "modeling",
  "elementFactory",
  "create",
  "autoPlace",
];

PnContextPadProvider.prototype.getContextPadEntries = function (element) {
  const connect = this._connect;
  const modeling = this._modeling;
  const elementFactory = this._elementFactory;
  const create = this._create;
  const autoPlace = this._autoPlace;

  function removeElement() {
    modeling.removeElements([element]);
  }

  function startConnect(event, element, autoActivate) {
    connect.start(event, element, autoActivate);
  }

  function appendPlace(event, element) {
    const shape = elementFactory.createShape({ type: "ptn:Place" });

    autoPlace.append(element, shape, { connection: { type: "ptn:Arc" } });
  }

  function appendPlaceStart(event) {
    const shape = elementFactory.createShape({ type: "ptn:Place" });

    create.start(event, shape, { source: element });
  }

  function appendTransition(event, element) {
    const shape = elementFactory.createShape({ type: "ptn:Transition" });

    autoPlace.append(element, shape, { connection: { type: "ptn:Arc" } });
  }

  function appendTransitionStart(event) {
    const shape = elementFactory.createShape({ type: "ptn:Transition" });

    create.start(event, shape, { source: element });
  }

  function addToken(event, element) {
    const marking = element.businessObject.marking;
    if (marking) {
      updateMarking(element, marking + 1);
    } else {
      updateMarking(element, 1);
    }
  }

  function removeToken(event, element) {
    const marking = element.businessObject.marking;
    if (marking && marking > 0) {
      updateMarking(element, marking - 1);
    }
  }

  function fireTransition(event, element) {
    triggerTransition(event, element, false);
  }

  function unfireTransition(event, element) {
    triggerTransition(event, element, true);
  }

  function triggerTransition(event, element, flowDirectionInverted) {
    if (canTrigger(element, flowDirectionInverted)) {
      const incoming = flowDirectionInverted
        ? element.outgoing
        : element.incoming;
      if (incoming) {
        for (const i of incoming) {
          const incomingId = flowDirectionInverted
            ? i.businessObject.target.id
            : i.businessObject.source.id;
          const weight = i.businessObject.weight ?? 1;
          const source = getChildById(root(element), incomingId);
          const marking = source.businessObject.marking ?? 0;
          updateMarking(source, parseInt(marking) - parseInt(weight));
        }
      }

      const outgoing = flowDirectionInverted
        ? element.incoming
        : element.outgoing;
      if (outgoing) {
        for (const o of outgoing) {
          const outgoingId = flowDirectionInverted
            ? o.businessObject.source.id
            : o.businessObject.target.id;
          const weight = o.businessObject.weight ?? 1;
          const target = getChildById(root(element), outgoingId);
          const marking = target.businessObject.marking ?? 0;
          updateMarking(target, parseInt(marking) + parseInt(weight));
        }
      }
    }
  }

  function canTrigger(element, flowDirectionInverted) {
    const incoming = flowDirectionInverted
      ? element.outgoing
      : element.incoming;
    if (incoming) {
      for (const i of incoming) {
        const incomingId = flowDirectionInverted
          ? i.businessObject.target.id
          : i.businessObject.source.id;
        const weight = i.businessObject.weight ?? 1;
        const source = getChildById(root(element), incomingId);
        const marking = source.businessObject.marking ?? 0;
        if (marking < weight) {
          return false;
        }
      }
    }
    return true;
  }

  function updateMarking(element, newMarking) {
    modeling.updateProperty(element, "marking", newMarking, {
      rerender: true,
    });
  }

  function getChildById(element, id) {
    return element.children.find((child) => child.id === id);
  }

  const actions = {};

  // Transition actions
  if (element.type === "ptn:Transition") {
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
    if (canTrigger(element, false)) {
      assign(actions, {
        "fire-transition": {
          group: "row_1",
          className: "pn-icon-fire-transition",
          title: "Fire transition",
          action: {
            click: fireTransition,
          },
        },
      });
    }
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
    if (canTrigger(element, true)) {
      assign(actions, {
        "unfire-transition": {
          group: "row_2",
          className: "pn-icon-unfire-transition",
          title: "Unfire transition",
          action: {
            click: unfireTransition,
          },
        },
      });
    }
  }

  // Place actions
  if (element.type === "ptn:Place") {
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
};
