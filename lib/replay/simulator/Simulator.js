import { FIRE_TRANSITION_EVENT } from "../EventHelper";
import { canTrigger, getChildById } from "../Utils";

const LOW_PRIORITY = 500;
export default function Simulator(eventBus, modeling, elementRegistry) {
  function updateMarking(element, newMarking) {
    modeling.updateProperty(element, "marking", newMarking, {
      rerender: true,
    });
  }

  function getCurrentMarking() {
    const marking = new Map();
    elementRegistry.forEach((element) => {
      if (element.type === "ptn:Place") {
        marking.set(
          element.id,
          element.businessObject.marking ? element.businessObject.marking : 0,
        );
      }
    });
    return marking;
  }

  function fireTransition(element) {
    triggerTransition(element, false);
  }

  function triggerTransition(element, flowDirectionInverted) {
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
          const source = getChildById(element.parent, incomingId);
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
          const target = getChildById(element.parent, outgoingId);
          const marking = target.businessObject.marking ?? 0;
          updateMarking(target, parseInt(marking) + parseInt(weight));
        }
      }
    }
  }

  function reset() {
    if (this.basemarking !== undefined) {
      elementRegistry.forEach((element) => {
        for (let [key, value] of this.basemarking) {
          if (element.id === key) {
            updateMarking(element, value);
          }
        }
      });

      this.basemarking = undefined;
    } else {
      this.basemarking = getCurrentMarking();
    }
  }

  this.basemarking = undefined;
  this.reset = reset;

  eventBus.on(FIRE_TRANSITION_EVENT, LOW_PRIORITY, (event) => {
    const { element } = event;
    fireTransition(element, false);
  });
}

Simulator.$inject = ["eventBus", "modeling", "elementRegistry"];
