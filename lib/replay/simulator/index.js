import Simulator from "./Simulator";

import { TOGGLE_MODE_EVENT } from "../EventHelper";
const HIGH_PRIORITY = 5000;

export default {
  __init__: [
    [
      "eventBus",
      "simulator",
      function (eventBus, simulator) {
        eventBus.on(TOGGLE_MODE_EVENT, HIGH_PRIORITY, (event) => {
          simulator.reset();
        });
        simulator.basemarking = undefined;
      },
    ],
  ],
  simulator: ["type", Simulator],
};
