import { getMid, asTRBL } from "diagram-js/lib/layout/LayoutUtil";
import {
  findFreePosition,
  generateGetNextPosition,
  getConnectedDistance
} from "diagram-js/lib/features/auto-place/AutoPlaceUtil";

export function getNewShapePosition(source, element) {
  if (element.type === 'pn:Place' || element.type === 'pn:Transition') {
    return getFlowNodePosition(source, element);
  }
}

/**
 * Always try to place element right of source;
 * compute actual distance from previous nodes in flow.
 */
export function getFlowNodePosition(source, element) {
  const sourceTrbl = asTRBL(source);
  const sourceMid = getMid(source);

  const horizontalDistance = getConnectedDistance(source, {
    filter: function filter(connection) {
      return connection.type === 'pn:Arc';
    }
  });

  const margin = 30,
    minDistance = 80,
    orientation = 'left';
  const position = {
    x: sourceTrbl.right + horizontalDistance + element.width / 2,
    y: sourceMid.y + getVerticalDistance(orientation, minDistance)
  };
  const nextPositionDirection = {
    y: {
      margin: margin,
      minDistance: minDistance
    }
  };
  return findFreePosition(source, element, position, generateGetNextPosition(nextPositionDirection));
}

function getVerticalDistance(orientation, minDistance) {
  console.log(orientation);
  if (orientation.indexOf('top') !== -1) {
    return -1 * minDistance;
  } else if (orientation.indexOf('bottom') !== -1) {
    return minDistance;
  } else {
    return 0;
  }
}
