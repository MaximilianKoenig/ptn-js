import {assign, sortBy} from 'min-dash';
import { getBusinessObject, is } from '../../util/Util';
import { getExternalLabelMid, existsExternalLabel, isLabel, requiresExternalLabel, getLabel } from '../LabelUtil';
import { getLabelAdjustment } from './util/LabelLayoutUtil';
import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
import { getNewAttachPoint } from 'diagram-js/lib/util/AttachUtil';
import { getMid, roundPoint } from 'diagram-js/lib/layout/LayoutUtil';
import { delta } from 'diagram-js/lib/util/PositionUtil';
import { getDistancePointLine, perpendicularFoot } from './util/GeometricUtil';
import { MODELER_PREFIX } from '../../util/constants';

const DEFAULT_LABEL_DIMENSIONS = {
  width: 90,
  height: 20
};

const NAME_PROPERTY = 'name';

/**
 * A component that makes sure that external labels are added
 * together with respective elements and properly updated (DI wise)
 * during move.
 */
export default class LabelBehavior extends CommandInterceptor {
  constructor(eventBus, modeling, customElementFactory, textRenderer) {
    super(eventBus);

    this._modeling = modeling;
    this._customElementFactory = customElementFactory;
    this._textRenderer = textRenderer;

    // Maintain a reference to the original this object
    const self = this;

    // TODO: Should this also happen for "weight" of arcs??
    // update label if name property was updated
    this.postExecute('element.updateProperties', function (e) {
      const context = e.context;
      const element = context.element;
      const properties = context.properties;

      if (NAME_PROPERTY in properties) {
        modeling.updateLabel(element, properties[NAME_PROPERTY]);
      }
    });

    // create label shape after shape/connection was created
    this.postExecute(['shape.create', 'connection.create'], function (e) {
      const context = e.context;
      const hints = context.hints || {};

      if (hints.createElementsBehavior === false) {
        return;
      }

      const element = context.shape || context.connection;
      const businessObject = element.businessObject;

      if (isLabel(element) || !requiresExternalLabel(element)) {
        return;
      }

      // only create label if attribute available
      if (!getLabel(element)) {
        return;
      }

      const labelCenter = getExternalLabelMid(element);

      // we don't care about x and y
      const labelDimensions = textRenderer.getExternalLabelBounds(
        DEFAULT_LABEL_DIMENSIONS,
        getLabel(element)
      );

      modeling.createLabel(element, labelCenter, {
        id: businessObject.id + '_label',
        businessObject: businessObject,
        width: labelDimensions.width,
        height: labelDimensions.height
      });
    });

    // update label after label shape was deleted
    this.postExecute('shape.delete', function (event) {
      const context = event.context;
      const labelTarget = context.labelTarget;
      const hints = context.hints || {};

      // check if label
      if (labelTarget && hints.unsetLabel !== false) {
        modeling.updateLabel(labelTarget, null, null, {removeShape: false});
      }
    });

    // update di information on label creation
    this.postExecute(['label.create'], function (event) {
      const context = event.context;
      const element = context.shape;
      let businessObject, di;

      // we want to trigger on real labels only
      if (!element.labelTarget) {
        return;
      }

      // we want to trigger on board elements only
      if (!is(element.labelTarget || element, `${MODELER_PREFIX}:ModelElement`)) {
        return;
      }

      businessObject = element.businessObject,
        di = businessObject.di;

      if (!di.label) {
        di.label = customElementFactory.createDiLabel(element);
      }

      assign(di.label.bounds, {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height
      });
    });

    this.postExecute([
      'connection.layout',
      'connection.updateWaypoints'
    ], function (event) {
      const context = event.context;
      const hints = context.hints || {};
  
      if (hints.labelBehavior === false) {
        return;
      }
  
      const connection = context.connection;
  
      for (let label of connection.labels) {
  
        // handle missing label as well as the case
        // that the label parent does not exist (yet),
        // because it is being pasted / created via multi element create
        //
        // Cf. https://github.com/bpmn-io/bpmn-js/pull/1227
        if (!label || !label.parent) {
          return;
        }
        const labelAdjustment = self.getVisibleLabelAdjustment(event, label);
  
        modeling.moveShape(label, labelAdjustment);
      }
  
    });
  
  
    // keep label position on shape replace
    this.postExecute(['shape.replace'], function (event) {
      const context = event.context;
      const newShape = context.newShape;
      const oldShape = context.oldShape;

      const businessObject = getBusinessObject(newShape);
  
      if (businessObject
        && requiresExternalLabel(businessObject)
        && oldShape.label
        && newShape.label) {
        newShape.label.x = oldShape.label.x;
        newShape.label.y = oldShape.label.y;
      }
    });
  
  
    // move external label after resizing
    this.postExecute('shape.resize', function (event) {
      const context = event.context;
      const shape = context.shape;
      const newBounds = context.newBounds;
      const oldBounds = context.oldBounds;
  
      if (existsExternalLabel(shape)) {
        const label = shape.label;
        const labelMid = getMid(label);
        const edges = asEdges(oldBounds);
  
        // get nearest border point to label as reference point
        const referencePoint = getReferencePoint(labelMid, edges);
  
        const delta = getReferencePointDelta(referencePoint, oldBounds, newBounds);
  
        modeling.moveShape(label, delta);
      }
    });
  }

  getVisibleLabelAdjustment(event, label) {
    const context = event.context;
    const connection = context.connection;
    const hints = assign({}, context.hints);
    const newWaypoints = context.newWaypoints || connection.waypoints;
    const oldWaypoints = context.oldWaypoints;


    if (typeof hints.startChanged === 'undefined') {
      hints.startChanged = !!hints.connectionStart;
    }

    if (typeof hints.endChanged === 'undefined') {
      hints.endChanged = !!hints.connectionEnd;
    }

    return getLabelAdjustment(label, newWaypoints, oldWaypoints, hints);
  }
}

LabelBehavior.$inject = [
  'eventBus',
  'modeling',
  'customElementFactory',
  'textRenderer'
];

// helpers //////////////////////

/**
 * Calculates a reference point delta relative to a new position
 * of a certain element's bounds
 */
export function getReferencePointDelta(referencePoint, oldBounds, newBounds) {
  const newReferencePoint = getNewAttachPoint(referencePoint, oldBounds, newBounds);
  return roundPoint(delta(newReferencePoint, referencePoint));
}

/**
 * Generates the nearest point (reference point) for a given point
 * onto given set of lines
 */
export function getReferencePoint(point, lines) {
  if (!lines.length) {
    return;
  }

  const nearestLine = getNearestLine(point, lines);
  return perpendicularFoot(point, nearestLine);
}

/**
 * Convert the given bounds to a lines array containing all edges
 */
export function asEdges(bounds) {
  return [
    [ // top
      {
        x: bounds.x,
        y: bounds.y
      },
      {
        x: bounds.x + (bounds.width || 0),
        y: bounds.y
      }
    ],
    [ // right
      {
        x: bounds.x + (bounds.width || 0),
        y: bounds.y
      },
      {
        x: bounds.x + (bounds.width || 0),
        y: bounds.y + (bounds.height || 0)
      }
    ],
    [ // bottom
      {
        x: bounds.x,
        y: bounds.y + (bounds.height || 0)
      },
      {
        x: bounds.x + (bounds.width || 0),
        y: bounds.y + (bounds.height || 0)
      }
    ],
    [ // left
      {
        x: bounds.x,
        y: bounds.y
      },
      {
        x: bounds.x,
        y: bounds.y + (bounds.height || 0)
      }
    ]
  ];
}

/**
 * Returns the nearest line for a given point by distance
 */
function getNearestLine(point, lines) {
  const distances = lines.map(function (l) {
    return {
      line: l,
      distance: getDistancePointLine(point, l)
    };
  });

  const sorted = sortBy(distances, 'distance');
  return sorted[0].line;
}
