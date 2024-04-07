import inherits from "inherits";
import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";
import { center, is } from "../../util/Util";
import { remove as collectionRemove } from 'diagram-js/lib/util/Collections';

export default function PnUpdater(eventBus, connectionDocking) {
  CommandInterceptor.call(this, eventBus);
  this._connectionDocking = connectionDocking;
  // Maintain a reference to the original this object
  that = this;

  // Crop connection ends to avoid overlapping with elements
  function cropConnection(e) {
    const context = e.context;
    const hints = context.hints || {};

    if (!context.cropped && hints.createElementsBehavior !== false) {
      const connection = context.connection;
      // connection.waypoints = that.connectionWaypoints(connection.source, connection.target);
      connection.waypoints = connectionDocking.getCroppedWaypoints(connection);
      context.cropped = true;
    }
  }

  this.executed(["connection.layout", "connection.create"], cropConnection);

  this.reverted(['connection.layout'], function (e) {
    delete e.context.cropped;
  });


  // // update parent
  // this.executed([
  //   'shape.create',
  //   'connection.create'
  // ], (event) => {
  //   const context = event.context;
  //   const element = context.shape || context.connection;

  //   linkToBusinessObjectParent(element)
  // });

  // this.executed([
  //   'shape.delete',
  //   'connection.delete'
  // ], (event) => {
  //   const context = event.context;
  //   const element = context.shape || context.connection;

  //   removeFromBusinessObjectParent(element)
  // });

  // // TODO!
  // // this.reverted([
  // //   'shape.create',
  // //   'connection.create'
  // // ], ...);

  //   // TODO!
  // // this.reverted([
  // //   'shape.delete',
  // //   'connection.delete'
  // // ], ...);

  // // TODO: check this ...
  // this.executed(['connection.create'], (event) => {
  //   const context = event.context;
  //   const element = context.connection;

  //   element.businessObject.source = element.source.businessObject;
  //   element.businessObject.target = element.target.businessObject;
  // });

  // // this.executed([
  // //   'shape.create',
  // //   'shape.move'
  // // ], event => {
  // //     const element = event.context.shape;
  // //     const {x, y} = element;
  // //     const businessObject = element.businessObject;
  // //     businessObject.set('x', x);
  // //     businessObject.set('y', y);
  // // });

  // // // Update root element
  // // function updateRoot(e) {
  // //   const context = e.context;
  // //   const oldRoot = context.oldRoot;
  // //   const children = oldRoot.children;

  // //   forEach(children, function(child) {
  // //     if (is(child, 'ptn:PnElement')) {
  // //       that.updateParent(child);
  // //     }
  // //   })
  // // }
  // // this.executed(['canvas.updateRoot'], updateRoot);
  // // this.reverted(['canvas.updateRoot'], updateRoot);

  // // update bounds of everything but labels
  // function updateBounds(e) {
  //   const shape = e.context.shape;
  //   if (!is(shape, 'ptn:PnElement')) {
  //     return;
  //   }

  //   that.updateBounds(shape);
  // }

  // this.executed([
  //   'shape.move',
  //   'shape.create',
  //   'shape.resize'
  // ], ifPn(function (e) {
  //   // exclude labels since they are handled differently during shape.changed
  //   if (e.context.shape.type === 'label') {
  //     return;
  //   }
  //   updateBounds(e)
  // }));

  // this.reverted([
  //   'shape.move',
  //   'shape.create',
  //   'shape.resize'
  // ], ifPn(function (e) {
  //   // exclude labels since they are handled differently during shape.changed
  //   if (e.context.shape.type === 'label') {
  //     return;
  //   }
  //   updateBounds(e)
  // }));  

  // // update label bounds
  // eventBus.on('shape.changed', function (e) {
  //   if (e.element.type === 'label') {
  //     updateBounds({ context: { shape: e.element } });
  //   }
  // });

  // // attach / detach connection
  // function updateConnection(e) {
  //   that.updateConnection(e.context)
  // }

  // this.executed([
  //   'connection.create',
  //   'connection.move',
  //   'connection.delete',
  //   'connection.reconnect'
  // ], ifPn(updateConnection));


  // this.reverted([
  //   'connection.create',
  //   'connection.move',
  //   'connection.delete',
  //   'connection.reconnect'
  // ], ifPn(updateConnection));

  // // update waypoints
  // function updateConnectionWaypoints(e) {
  //   that.updateConnectionWaypoints(e.context.connection);
  // }

  // this.executed([
  //   'connection.layout',
  //   'connection.move',
  //   'connection.updateWaypoints',
  // ], ifPn(updateConnectionWaypoints));

  // this.reverted([
  //   'connection.layout',
  //   'connection.move',
  //   'connection.updateWaypoints',
  // ], ifPn(updateConnectionWaypoints));

  // // update attachments
  // function updateAttachment(e) {
  //   that.updateAttachment(e.context);
  // }

  // this.executed(['element.updateAttachment'], ifPn(updateAttachment));
  // this.reverted(['element.updateAttachment'], ifPn(updateAttachment));

}

inherits(PnUpdater, CommandInterceptor);

PnUpdater.$inject = ["eventBus", "connectionDocking"];




// PnUpdater.prototype.updateAttachment = function (context) {
//   const shape = context.shape;
//   const businessObject = shape.businessObject;
//   const host = shape.host;

//   businessObject.attachedToRef = host && host.businessObject;
// }

// function linkToBusinessObjectParent(element) {
//   const parentShape = element.parent;

//   const businessObject = element.businessObject;
//   const parentBusinessObject = parentShape && parentShape.businessObject;

//   parentBusinessObject.get('Elements').push(businessObject);
//   businessObject.$parent = parentBusinessObject;
// }

// function removeFromBusinessObjectParent(element) {
//   const businessObject = element.businessObject;
//   const parentBusinessObject = businessObject.$parent;

//   collectionRemove(parentBusinessObject.get('Elements'), businessObject);
//   businessObject.$parent = undefined;
// }













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


/**
 * Make sure the event listener is only called
 * if the touched element is a od element.
 *
 * @param  {Function} fn
 * @return {Function} guarded function
 */
function ifPn(fn) {

  return function (event) {

    const context = event.context;
    const element = context.shape || context.connection;

    if (is(element, 'ptn:PnElement')) {
      fn(event);
    }
  };
}
