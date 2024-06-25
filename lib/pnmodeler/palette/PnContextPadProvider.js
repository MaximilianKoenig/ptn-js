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
      modeling.updateProperty(element, "marking", marking + 1, {
        rerender: true,
      });
    } else {
      modeling.updateProperty(element, "marking", 1, { rerender: true });
    }
  }

  function removeToken(event, element) {
    const marking = element.businessObject.marking;
    if (marking && marking > 0) {
      modeling.updateProperty(element, "marking", marking - 1, {
        rerender: true,
      });
    }
  }

  function fireTransition(event, element) {
    triggerTransition(event, element, true);
  }

  function unfireTransition(event, element) {
    triggerTransition(event, element, false);
  }

  function triggerTransition(event, element, flowDirection) {
    if (canTrigger(element, flowDirection)) {
      const incoming = flowDirection ? element.incoming : element.outgoing;
      if (incoming) {
        for (const i of incoming) {
          const incomingId = flowDirection
            ? i.businessObject.source.id
            : i.businessObject.target.id;
          const weight = i.businessObject.weight ?? 1;
          const source = root(element).children.find(
            (child) => child.id === incomingId,
          );
          const marking = source.businessObject.marking;
          if (marking && marking >= weight) {
            modeling.updateProperty(source, "marking", marking - weight, {
              rerender: true,
            });
          }
        }
      }
      const outgoing = flowDirection ? element.outgoing : element.incoming;
      if (outgoing) {
        for (const o of outgoing) {
          const outgoingId = flowDirection
            ? o.businessObject.target.id
            : o.businessObject.source.id;
          const weight = o.businessObject.weight ?? 1;
          const target = root(element).children.find(
            (child) => child.id === outgoingId,
          );
          const marking = target.businessObject.marking;
          if (marking) {
            modeling.updateProperty(
              target,
              "marking",
              parseInt(marking) + parseInt(weight),
              {
                rerender: true,
              },
            );
          } else {
            modeling.updateProperty(target, "marking", weight, {
              rerender: true,
            });
          }
        }
      }
    }
  }

  function canTrigger(element, flowDirection) {
    const incoming = flowDirection ? element.incoming : element.outgoing;
    if (incoming) {
      for (const i of incoming) {
        const incomingId = flowDirection
          ? i.businessObject.source.id
          : i.businessObject.target.id;
        const weight = i.businessObject.weight ?? 1;
        const source = root(element).children.find(
          (child) => child.id === incomingId,
        );
        const marking = source.businessObject.marking ?? 0;
        if (marking < weight) {
          return false;
        }
      }
    }
    return true;
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
    if (canTrigger(element, true)) {
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
    if (canTrigger(element, false)) {
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
