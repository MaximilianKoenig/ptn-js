import { getNewShapePosition } from './PnAutoPlaceUtil';

export default function PnAutoPlace(eventBus) {
  eventBus.on('autoPlace', function(context) {
    const shape = context.shape;
    const source = context.source;

    return getNewShapePosition(source, shape);
  });
}

PnAutoPlace.$inject = [
  'eventBus'
];
