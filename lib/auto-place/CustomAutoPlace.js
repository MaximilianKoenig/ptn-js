import { getNewShapePosition } from "./CustomAutoPlaceUtil";

export default function CustomAutoPlace(eventBus) {
  eventBus.on("autoPlace", function (context) {
    const shape = context.shape;
    const source = context.source;

    return getNewShapePosition(source, shape);
  });
}

CustomAutoPlace.$inject = ["eventBus"];
