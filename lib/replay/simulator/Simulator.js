import {
  FIRE_TRANSITION_EVENT,
  RESET_SIMULATION_EVENT,
  TOGGLE_MODE_EVENT,
  UNDO_SIMULATION_EVENT,
} from "../EventHelper";
import { canTrigger, getChildById } from "../Utils";

const LOW_PRIORITY = 500;
const HIGH_PRIORITY = 5000;

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

  function unfireTransition(element) {
    triggerTransition(element, true);
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
          const weight = i.businessObject.inscription ?? 1;
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
          const weight = o.businessObject.inscription ?? 1;
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
    }
    this.trace = [];
  }

  this.basemarking = undefined;
  this.trace = [];
  this.reset = reset;

  eventBus.on(RESET_SIMULATION_EVENT, HIGH_PRIORITY, (event) => {
    this.reset();
  });

  eventBus.on(TOGGLE_MODE_EVENT, HIGH_PRIORITY, (event) => {
    const active = event.active;
    if (active) {
      this.basemarking = getCurrentMarking();
    } else {
      this.reset();
      this.basemarking = undefined;
    }
  });

  eventBus.on(FIRE_TRANSITION_EVENT, LOW_PRIORITY, (event) => {
    const { element } = event;
    fireTransition(element);
    this.trace.push(element);
  });

  eventBus.on(UNDO_SIMULATION_EVENT, LOW_PRIORITY, (event) => {
    const element = this.trace.pop();
    unfireTransition(element);
  });
}

Simulator.$inject = ["eventBus", "modeling", "elementRegistry"];
