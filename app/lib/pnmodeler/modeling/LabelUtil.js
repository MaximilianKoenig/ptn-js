import { isAny } from '../../util/Util';
import { assign } from 'min-dash';

export function getLabel(element) {
  const businessObject = element.businessObject;
  const attr = getLabelAttribute(element);
  if (attr) {
    return businessObject[attr] || '';
  }
}

export function getLabelAttribute(element) {
  const businessObject = element.businessObject;
  if (isAny(businessObject, ['ptn:Place', 'ptn:Transition'])) {
    return 'name';
  } else if (isAny(businessObject, ['ptn:Arc'])) {
    return 'weight';
  }
}

export function setLabel(element, text) {
  const businessObject = element.businessObject;
  const attr = getLabelAttribute(element);
  if (attr) {
    businessObject[attr] = text;
  }
  return element;
}

export function isLabel(element) {
  return element && !!element.labelTarget;
}

// Returns true if there exists an external label for the given element
export function existsExternalLabel(element) {
  return isLabel(element.label);
}

// Returns true if labels for that type of element are external
export function requiresExternalLabel(element) {
  return isAny(element.businessObject, ['ptn:Place', 'ptn:Arc']);
}

export const DEFAULT_LABEL_SIZE = {
  width: 90,
  height: 20
};

const FLOW_LABEL_INDENT = 15;

export function getExternalLabelMid(element) {

  if (element.waypoints) {
    return getFlowLabelPosition(element.waypoints);
  } else {
    return {
      x: element.x + element.width / 2,
      y: element.y + element.height + DEFAULT_LABEL_SIZE.height / 2
    };
  }
}

export function getExternalLabelBounds(businessObject, element) {

  let mid;
  let size;
  let bounds;

  const di = businessObject.di;
  const label = di['label'];
  console.log(label);

  if (label && label.bounds) {
      bounds = label.bounds;

      size = {
          width: Math.max(DEFAULT_LABEL_SIZE.width, bounds.width),
          height: bounds.height
      };

      mid = {
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height / 2
      };
  } else {

      mid = getExternalLabelMid(element);

      size = DEFAULT_LABEL_SIZE;
  }

  return assign({
      x: mid.x - size.width / 2,
      y: mid.y - size.height / 2
  }, size);
}

function getFlowLabelPosition(waypoints) {

  // get the waypoints mid
  const mid = waypoints.length / 2 - 1;

  const first = waypoints[Math.floor(mid)];
  const second = waypoints[Math.ceil(mid + 0.01)];

  // get position
  const position = getWaypointsMid(waypoints);

  // calculate angle
  const angle = Math.atan((second.y - first.y) / (second.x - first.x));

  let x = position.x;
  let y = position.y;

  if (Math.abs(angle) < Math.PI / 2) {
    y -= FLOW_LABEL_INDENT;
  } else {
    x += FLOW_LABEL_INDENT;
  }

  return { x: x, y: y };
}

function getWaypointsMid(waypoints) {

  const mid = waypoints.length / 2 - 1;

  const first = waypoints[Math.floor(mid)];
  const second = waypoints[Math.ceil(mid + 0.01)];

  return {
    x: first.x + (second.x - first.x) / 2,
    y: first.y + (second.y - first.y) / 2
  };
}
