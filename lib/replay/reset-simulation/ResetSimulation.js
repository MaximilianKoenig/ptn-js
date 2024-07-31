import { domify, classes as domClasses, event as domEvent } from "min-dom";

import {
  TOGGLE_MODE_EVENT,
  RESET_SIMULATION_EVENT,
  FIRE_TRANSITION_EVENT,
} from "../EventHelper";

export default function ResetSimulation(eventBus, tokenSimulationPalette) {
  this._eventBus = eventBus;
  this._tokenSimulationPalette = tokenSimulationPalette;

  this._init();
  eventBus.on(FIRE_TRANSITION_EVENT, () => {
    domClasses(this._paletteEntry).remove("disabled");
  });
  eventBus.on(TOGGLE_MODE_EVENT, (event) => {
    const active = (this._active = event.active);

    if (!active) {
      this.resetSimulation();
    }
  });
  eventBus.on(RESET_SIMULATION_EVENT, () => {
    domClasses(this._paletteEntry).add("disabled");
  });
}

ResetSimulation.prototype._init = function () {
  this._paletteEntry = domify(`
    <div class="bts-entry disabled" title="Reset Simulation">
        <span class="pn-icon-reset">
    </div>
  `);

  domEvent.bind(this._paletteEntry, "click", () => {
    this.resetSimulation();
  });

  this._tokenSimulationPalette.addEntry(this._paletteEntry, 1);
};

ResetSimulation.prototype.resetSimulation = function () {
  this._eventBus.fire(RESET_SIMULATION_EVENT);
};

ResetSimulation.$inject = ["eventBus", "tokenSimulationPalette"];
