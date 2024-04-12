import inherits from "inherits";
import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";
import { center, getBusinessObject, is } from "../../util/Util";
import { remove as collectionRemove } from 'diagram-js/lib/util/Collections';
import { isLabel } from "./LabelUtil";
import { assign, forEach } from "min-dash";

export default function PnUpdater(eventBus, pnElementFactory, connectionDocking, translate) {

  CommandInterceptor.call(this, eventBus);

  this._pnElementFactory = pnElementFactory;
  this._connectionDocking = connectionDocking;
  this._translate = translate;
  // Maintain a reference to the original this object
  const self = this;

  // Crop connection ends to avoid overlapping with elements
  function cropConnection(e) {
    const context = e.context;
    const hints = context.hints || {};

    if (!context.cropped && hints.createElementsBehavior !== false) {
      const connection = context.connection;
      // connection.waypoints = self.connectionWaypoints(connection.source, connection.target);
      connection.waypoints = connectionDocking.getCroppedWaypoints(connection);
      context.cropped = true;
    }
  }

  this.executed(["connection.layout", "connection.create"], cropConnection);

  this.reverted(['connection.layout'], function (e) {
    delete e.context.cropped;
  });


  // DI Update
  function updateParent(e) {
    const context = e.context;
    const element = context.shape || context.connection;
    self.updateDiAndSemanticParent(element, context.oldParent);
  }

  function reverseUpdateParent(e) {
    const context = e.context;
    const element = context.shape || context.connection;
    const oldParent = context.parent ||context.newParent;
    self.updateDiAndSemanticParent(element, oldParent);
  }

  this.executed([
    'shape.move',
    'shape.create',
    'shape.delete',
    'connection.create',
    'connection.move',
    'connection.delete'
  ], ifPnElement(updateParent));

  this.reverted([
    'shape.move',
    'shape.create',
    'shape.delete',
    'connection.create',
    'connection.move',
    'connection.delete'
  ], ifPnElement(reverseUpdateParent));


  // Update root element of canvas
  function updateRoot(e) {
    const context = event.context;
    const oldRoot = context.oldRoot;
    const children = oldRoot.children;

    forEach(children, function (child) {
      if (is(child, 'ptn:PtnElement')) {
        self.updateParent(child);
      }
    });
  }

  this.executed(['canvas.updateRoot'], updateRoot);
  this.reverted(['canvas.updateRoot'], updateRoot);


  // Update bounds of everything but labels
  function updateBounds(e) {
    const shape = e.context.shape;
    if (!is(shape, 'ptn:PtnElement')) {
      return;
    }

    self.updateBounds(shape);
  }

  this.executed([
    'shape.move',
    'shape.create',
    'shape.resize'
  ], ifPnElement(function (e) {
    // Exclude labels since they are handled differently during shape.changed
    if (e.context.shape.type === 'label') {
      return;
    }
    updateBounds(e);
  }));

  this.reverted([
    'shape.move',
    'shape.create',
    'shape.resize'
  ], ifPnElement(function (e) {
    // Exclude labels since they are handled differently during shape.changed
    if (e.context.shape.type === 'label') {
      return;
    }
    updateBounds(e);
  }));

  
  // Update label bounds
  eventBus.on('shape.changed', function (e) {
    if (e.element.type === 'label') {
      updateBounds({ context: { shape: e.element } });
    }
  });


  // Update connections
  function updateConnection(e) {
    const context = e.context;
    self.updateConnection(context);
  }

  this.executed([
    'connection.create',
    'connection.move',
    'connection.delete',
    'connection.reconnect'
  ], ifPnElement(updateConnection));

  this.reverted([
    'connection.create',
    'connection.move',
    'connection.delete',
    'connection.reconnect'
  ], ifPnElement(updateConnection));


  // Update waypoints

  function updateConnectionWaypoints(e) {
    self.updateConnectionWaypoints(e.context.connection);
  }

  this.executed([
    'connection.layout',
    'connection.move',
    'connection.updateWaypoints'
  ], ifPnElement(updateConnectionWaypoints));

  this.reverted([
    'connection.layout',
    'connection.move',
    'connection.updateWaypoints'
  ], ifPnElement(updateConnectionWaypoints));
}

inherits(PnUpdater, CommandInterceptor);

PnUpdater.$inject = [
  "eventBus",
  "pnElementFactory",
  "connectionDocking",
  "translate"
];

PnUpdater.prototype.updateDiAndSemanticParent = function(element, oldParent) {
  // a label's parent does not change here
  if (element.type === 'label') {
    return;
  }

  const parentShape = element.parent;
  const businessObject = element.businessObject;
  const parentBusinessObject = parentShape && parentShape.businessObject;
  const parentDi = parentBusinessObject && parentBusinessObject.di;

  this.updateSemanticParent(businessObject, parentBusinessObject);
  this.updateDiParent(businessObject.di, parentDi);
};

PnUpdater.prototype.updateSemanticParent = function(businessObject, newParent) {
  let containment = businessObject.$parent;
  const translate = this._translate;

  if (businessObject.$parent === newParent) {
    return;
  }

  if (is(businessObject, 'ptn:PtnElement')) {
    containment = 'ptnElements'
  }

  if (!containment) {
    throw new Error(translate(
      'no parent for {element} in {parent}',
      {
        element: businessObject.id,
        parent: newParent.id
      }
    ));
  }

  let children;

  if (businessObject.$parent) {
    // Remove from old parent
    children = businessObject.$parent.get(containment);
    collectionRemove(children, businessObject);
  }

  if (!newParent) {
    businessObject.$parent = null;
  } else {
    // Add to new parent
    children = newParent.get(containment);
    children.push(businessObject);

    businessObject.$parent = newParent;
  }
}

PnUpdater.prototype.updateDiParent = function(di, parentDi) {
  if (parentDi && !is(parentDi, 'ptnDi:PtnPlane')) {
    parentDi = parentDi.$parent;
  }

  if (di.$parent === parentDi) {
    return;
  }

  const planeElements = (parentDi || di.$parent).get('planeElement');

  if (parentDi) {
    planeElements.push(di);
    di.$parent = parentDi;
  } else {
    collectionRemove(planeElements, di);
    di.$parent = null;
  }
}

PnUpdater.prototype.updateBounds = function (shape) {
  const di = shape.businessObject.di;
  const target = isLabel(shape) ? this._getLabel(di) : di;
  let bounds = target.bounds;

  if (!bounds) {
    bounds = this._pnElementFactory.createDiBounds();
    target.set('bounds', bounds);
  }

  assign(bounds, {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height
  });
};

PnUpdater.prototype.updateConnection = function (context) {
  const connection = context.connection;
  const businessObject = getBusinessObject(connection);
  const newSource = getBusinessObject(connection.source);
  const newTarget = getBusinessObject(connection.target);

  if (businessObject.source !== newSource) {
    businessObject.source = newSource;
  }

  if (businessObject.target !== newTarget) {
    businessObject.target = newTarget;
  }

  this.updateConnectionWaypoints(connection);
  this.updateDiConnection(businessObject.di, newSource, newTarget);
}

PnUpdater.prototype.updateConnectionWaypoints = function (connection) {
  connection.businessObject.di.set('waypoints', this._pnElementFactory.createDiWaypoints(connection.waypoints));
}

PnUpdater.prototype.updateDiConnection = function (di, newSource, newTarget) {
  if (di.sourceElement && di.sourceElement.ptnElement !== newSource) {
    di.sourceElement = newSource && newSource.di;
  }

  if (di.targetElement && di.targetElement.ptnElement !== newTarget) {
    di.targetElement = newTarget && newTarget.di;
  }
}

PnUpdater.prototype.connectionWaypoints = function (source, target) {
  const connection = { source, target };
  // if (connection.source === connection.target) {
  //   connection.waypoints = reflectiveEdge(connection.source);
  // } else {
  //     //TODO: Handle bidirectional edges
  //     connection.waypoints = [center(connection.source), center(connection.target)];
  // }
  connection.waypoints = [center(connection.source), center(connection.target)];
  connection.waypoints = this._connectionDocking.getCroppedWaypoints(connection);
  // console.log(this._connectionDocking.getDockingPoint(connection, connection.source));
  return connection.waypoints;
}


// Helpers

PnUpdater.prototype._getLabel = function(di) {
  if (!di.label) {
    di.label = this._pnElementFactory.createDiLabel();
  }

  return di.label;
}

function ifPnElement(fn) {
  return function (event) {
    const context = event.context;
    const element = context.shape || context.connection;

    if (is(element, 'ptn:PtnElement')) {
      fn(event);
    }
  };
}
