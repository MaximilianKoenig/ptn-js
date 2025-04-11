import { asTRBL, getMid, getOrientation } from 'diagram-js/lib/layout/LayoutUtil';
import { substract } from 'diagram-js/lib/util/Math';
import { existsExternalLabel } from '../LabelUtil';
import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

const ALIGNMENTS = [
  'top',
  'bottom',
  'left',
  'right'
];

const ELEMENT_LABEL_DISTANCE = 10;

/**
 * A component that makes sure that external labels are added
 * together with respective elements and properly updated (DI wise)
 * during move.
 */
export default class AdaptiveLabelPositioningBehavior extends CommandInterceptor {
  constructor(eventBus, modeling) {
    super(eventBus);

    this._modeling = modeling;

    // Maintain a reference to the original this object
    const self = this;

    this.postExecuted([
      'connection.create',
      'connection.layout',
      'connection.updateWaypoints'
    ], function (event) {
      const context = event.context;
      const connection = context.connection;
      const source = connection.source;
      const target = connection.target;
      const hints = context.hints || {};

      if (hints.createElementsBehavior !== false) {
        self.checkLabelAdjustment(source);
        self.checkLabelAdjustment(target);
      }
    });

    this.postExecuted([
      'label.create'
    ], function (event) {
      const context = event.context;
      const shape = context.shape;
      const hints = context.hints || {};

      if (hints.createElementsBehavior !== false) {
        self.checkLabelAdjustment(shape.labelTarget);
      }
    });

    this.postExecuted([
      'elements.create'
    ], function (event) {
      const context = event.context;
      const elements = context.elements;
      const hints = context.hints || {};

      if (hints.createElementsBehavior !== false) {
        elements.forEach(function (element) {
          self.checkLabelAdjustment(element);
        });
      }
    });
  }

  checkLabelAdjustment(element) {
    // skip non-existing labels
    if (!existsExternalLabel(element)) {
      return;
    }

    const optimalPosition = getOptimalPosition(element);

    // no optimal position found
    if (!optimalPosition) {
      return;
    }

    this.adjustLabelPosition(element, optimalPosition);
  }

  adjustLabelPosition(element, orientation) {
    const elementMid = getMid(element);
    const label = element.label;
    const labelMid = getMid(label);

    // ignore labels that are being created
    if (!label.parent) {
      return;
    }

    const elementTrbl = asTRBL(element);
    let newLabelMid;

    switch (orientation) {
      case 'top':
        newLabelMid = {
          x: elementMid.x,
          y: elementTrbl.top - ELEMENT_LABEL_DISTANCE - label.height / 2
        };
        break;

      case 'left':
        newLabelMid = {
          x: elementTrbl.left - ELEMENT_LABEL_DISTANCE - label.width / 2,
          y: elementMid.y
        };
        break;

      case 'bottom':
        newLabelMid = {
          x: elementMid.x,
          y: elementTrbl.bottom + ELEMENT_LABEL_DISTANCE + label.height / 2
        };
        break;

      case 'right':
        newLabelMid = {
          x: elementTrbl.right + ELEMENT_LABEL_DISTANCE + label.width / 2,
          y: elementMid.y
        };
        break;
    }

    const delta = substract(newLabelMid, labelMid);
    this._modeling.moveShape(label, delta);
  }
}

AdaptiveLabelPositioningBehavior.$inject = [
  'eventBus',
  'modeling'
];


// helpers //////////////////////

/**
 * Return alignments which are taken by a boundary's host element
 */
function getTakenHostAlignments(element) {
  const hostElement = element.host;
  const elementMid = getMid(element);
  const hostOrientation = getOrientation(elementMid, hostElement);

  let freeAlignments;

  // check whether there is a multi-orientation, e.g. 'top-left'
  if (hostOrientation.indexOf('-') >= 0) {
    freeAlignments = hostOrientation.split('-');
  } else {
    freeAlignments = [hostOrientation];
  }

  const takenAlignments = ALIGNMENTS.filter(function (alignment) {
    return freeAlignments.indexOf(alignment) === -1;
  });

  return takenAlignments;
}

/**
 * Return alignments which are taken by related connections
 */
function getTakenConnectionAlignments(element) {
  const elementMid = getMid(element);

  const takenAlignments = [].concat(
    element.incoming.map(function (c) {
      return c.waypoints[c.waypoints.length - 2];
    }),
    element.outgoing.map(function (c) {
      return c.waypoints[1];
    })
  ).map(function (point) {
    return getApproximateOrientation(elementMid, point);
  });

  return takenAlignments;
}

/**
 * Return the optimal label position around an element
 * or _undefined_, if none was found.
 */
function getOptimalPosition(element) {
  const labelMid = getMid(element.label);
  const elementMid = getMid(element);
  const labelOrientation = getApproximateOrientation(elementMid, labelMid);

  if (!isAligned(labelOrientation)) {
    return;
  }

  let takenAlignments = getTakenConnectionAlignments(element);

  if (element.host) {
    const takenHostAlignments = getTakenHostAlignments(element);
    takenAlignments = takenAlignments.concat(takenHostAlignments);
  }

  const freeAlignments = ALIGNMENTS.filter(function (alignment) {
    return takenAlignments.indexOf(alignment) === -1;
  });

  // NOTHING TO DO; label already aligned a.O.K.
  if (freeAlignments.indexOf(labelOrientation) !== -1) {
    return;
  }

  return freeAlignments[0];
}

function getApproximateOrientation(p0, p1) {
  return getOrientation(p1, p0, 5);
}

function isAligned(orientation) {
  return ALIGNMENTS.indexOf(orientation) !== -1;
}
