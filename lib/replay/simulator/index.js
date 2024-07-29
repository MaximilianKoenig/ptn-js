import Simulator from "./Simulator";

const HIGH_PRIORITY = 5000;

export default {
  __init__: [
    [
      "eventBus",
      "simulator",
      function (eventBus, simulator) {
        eventBus.on(
          ["tokenSimulation.toggleMode", "tokenSimulation.resetSimulation"],
          HIGH_PRIORITY,
          (event) => {
            simulator.reset();
          },
        );
      },
    ],
  ],
  simulator: ["type", Simulator],
};
