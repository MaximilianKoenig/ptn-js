import inherits from "inherits";
import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";
import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  classes as svgClasses
} from 'tiny-svg';


export default function PnRenderer(eventBus) {
  BaseRenderer.call(this, eventBus, 2000);


  this.drawPlace = function (parentGfx, element) {
    const shape = svgCreate('path');
    svgAttr(shape, {
      d: getPlacePath(0, 0, element.width, element.height),
      fill: 'white',
      fillOpacity: 0.95,
      stroke: 'black',
      // strokeWidth: 2
    });
    svgAppend(parentGfx, shape);
    return parentGfx;
  };
}

inherits(PnRenderer, BaseRenderer);

ChoreoRenderer.$inject = [
  'eventBus'
];

PnRenderer.prototype.canRender = function (element) {
  return true;
};

PnRenderer.prototype.drawShape = function (parentGfx, element) {
  if (element.type === 'pn:Place') {
    return this.drawPlace(parentGfx, element);
  } else if (element.type === 'pn:Transition') {
    return this.drawTransition(parentGfx, element);
  }
};


// The following functions return the svg path for the respective shapes.
// For further details, see https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
function getTransitionPath(x, y, width, height) {
  return componentsToPath([
    ['M', x, y],
    ['H', width],
    ['V', height],
    ['H', -width],
    ['z']
  ]);
}

function getPlacePath(x, y, width, height) {
  const radius = width / 2;

  // Get center coordinates of the circle
  const cx = x + radius;
  const cy = y + radius;

  return componentsToPath([
    ['M', cx, cy],
    ['m', 0, -radius],
    ['a', radius, radius, 0, 1, 1, 0, 2 * radius],
    ['a', radius, radius, 0, 1, 1, 0, -2 * radius]
  ]);
}
