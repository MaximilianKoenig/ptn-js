import { assign } from "min-dash";

import CustomModdle from "./CustomModdle";

import ModelDescriptors from "./resources/modelSchema";
import DiagramDescriptors from "./resources/diagramSchema";
import DcDescriptors from "./resources/dc.json";

const packages = {
  modelSchema: ModelDescriptors,
  diagramSchema: DiagramDescriptors,
  dc: DcDescriptors,
};

export default function (additionalPackages, options) {
  const pks = assign({}, packages, additionalPackages);

  return new CustomModdle(pks, options);
}
