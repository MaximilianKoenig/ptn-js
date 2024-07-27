import Replay from "./Replay";
import ContextPadModule from "diagram-js/lib/features/context-pad";

export default {
  __depends__: [ContextPadModule],
  __init__: ["replay"],
  replay: ["type", Replay],
};
