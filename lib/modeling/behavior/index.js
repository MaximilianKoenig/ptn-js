import AdaptiveLabelPositioningBehavior from "./AdaptiveLabelPositioningBehavior";
import LabelBehavior from "./LabelBehavior";

export default {
  __init__: ["adaptiveLabelPositioningBehavior", "labelBehavior"],
  adaptiveLabelPositioningBehavior: ["type", AdaptiveLabelPositioningBehavior],
  labelBehavior: ["type", LabelBehavior],
};
