import RulesModule from "diagram-js/lib/features/rules";

import CustomRuleProvider from "./CustomRuleProvider";

export default {
  __depends__: [RulesModule],
  __init__: ["customRuleProvider"],
  customRuleProvider: ["type", CustomRuleProvider],
};
