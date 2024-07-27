import { domify, classes as domClasses, event as domEvent } from "min-dom";
import { query as domQuery } from "min-dom";

export default function Replay(
  eventBus,
  canvas,
  contextPad,
  selection,
  elementRegistry,
) {
  this._eventBus = eventBus;
  this._canvas = canvas;

  eventBus.on("import.parse.complete", (event) => {
    this._init(event.definitions);
  });
}

Replay.prototype._init = function (definitions) {
  // const arcs = [];
  // const transitions = [];
  // const places = [];
  // console.log(definitions);
  // definitions.ptnDiagram.plane.planeElement.forEach(function (element) {
  //   if (element.ptnElement.$type === "ptn:Arc") {
  //     arcs.push(element);
  //   } else if (element.ptnElement.$type === "ptn:Transition") {
  //     transitions.push(element);
  //   } else if (element.ptnElement.$type === "ptn:Place") {
  //     places.push(element);
  //   }
  //   console.log(element);
  // });
  // console.log(arcs);
  // console.log(places);
  // console.log(transitions);
  // transitions.forEach(function (transition) {
  //   const bounds = transition.bounds;
  //   const span2 = domify(
  //     `<span style="position: absolute; left: ${bounds.x}px; ${bounds.y}top: px">Test</span>`,
  //   );
  //   const span = domify(
  //     `<p style="position: absolute; left: ${bounds.x}px; ${bounds.y}top: px">Test</p>`,
  //   );
  //   console.log(span);
  //   this._canvas.appendChild(span);
  // });
};

Replay.$inject = [
  "eventBus",
  "canvas",
  "contextPad",
  "selection",
  "elementRegistry",
];
