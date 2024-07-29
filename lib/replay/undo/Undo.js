import { domify, classes as domClasses, event as domEvent } from "min-dom";

import {
  TOGGLE_MODE_EVENT,
  UNDO_SIMULATION_EVENT,
  FIRE_TRANSITION_EVENT,
  RESET_SIMULATION_EVENT,
} from "../EventHelper";

export default function Undo(eventBus, tokenSimulationPalette) {
  this._eventBus = eventBus;
  this._tokenSimulationPalette = tokenSimulationPalette;
  this.firedTransitions = 0;

  this._init();
  eventBus.on(FIRE_TRANSITION_EVENT, () => {
    this.firedTransitions += 1;
    domClasses(this._paletteEntry).remove("disabled");
  });
  eventBus.on([TOGGLE_MODE_EVENT, RESET_SIMULATION_EVENT], () => {
    this.firedTransitions = 0;
    domClasses(this._paletteEntry).add("disabled");
  });
}

Undo.prototype._init = function () {
  this._paletteEntry = domify(`
    <div class="bts-entry disabled" title="Undo">
        <span class="pn-icon-unfire-transition">
    </div>
  `);

  domEvent.bind(this._paletteEntry, "click", () => {
    this.undo();
  });

  this._tokenSimulationPalette.addEntry(this._paletteEntry, 1);
};

Undo.prototype.undo = function () {
  this.firedTransitions -= 1;
  if (this.firedTransitions === 0) {
    domClasses(this._paletteEntry).add("disabled");
    this._eventBus.fire(RESET_SIMULATION_EVENT);
  } else {
    this._eventBus.fire(UNDO_SIMULATION_EVENT);
  }
};

Undo.$inject = ["eventBus", "tokenSimulationPalette"];
