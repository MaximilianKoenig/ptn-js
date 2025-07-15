import {
  query as domQuery,
  domify,
  classes as domClasses,
  event as domEvent,
} from "min-dom";

import { TOGGLE_MODE_EVENT } from "../EventHelper";

export default function ToggleSimulationMode(
  eventBus,
  canvas,
  selection,
  contextPad,
) {
  this._eventBus = eventBus;
  this._canvas = canvas;
  this._selection = selection;
  this._contextPad = contextPad;

  this._active = false;

  eventBus.on("import.parse.start", () => {
    if (this._active) {
      this.toggleMode(false);

      eventBus.once("import.done", () => {
        this.toggleMode(true);
      });
    }
  });

  eventBus.on("diagram.init", () => {
    this._canvasParent = this._canvas.getContainer();
    this._palette = domQuery(".djs-palette", this._canvas.getContainer());
    this._init();
  });
}

ToggleSimulationMode.prototype._init = function () {
  this._container = domify(`
    <div class="ptn-toggle-mode">
      Token Replay 
      <span class="ptn-toggle">
        <span class="pn-icon-toggle-off">
        </span>
      </span>
    </div>
  `);

  domEvent.bind(this._container, "click", () => this.toggleMode());

  this._canvas.getContainer().appendChild(this._container);
};

ToggleSimulationMode.prototype.toggleMode = function (active = !this._active) {
  if (active === this._active) {
    return;
  }

  if (active) {
    this._container.innerHTML = `Token Replay <span class="ptn-toggle"><span class="pn-icon-toggle-on"></span></span>`;

    domClasses(this._palette).add("hidden");
    domClasses(this._canvasParent).add("simulation");
  } else {
    this._container.innerHTML = `Token Replay <span class="ptn-toggle"><span class="pn-icon-toggle-off"></span></span>`;
    domClasses(this._canvasParent).remove("simulation");
    domClasses(this._palette).remove("hidden");
    const elements = this._selection.get();

    if (elements.length === 1) {
      this._contextPad.open(elements[0]);
    }
  }

  this._eventBus.fire(TOGGLE_MODE_EVENT, {
    active,
  });

  this._active = active;
};

ToggleSimulationMode.$inject = [
  "eventBus",
  "canvas",
  "selection",
  "contextPad",
];
