import inherits from "inherits";
import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";
import { center } from "../../util/Util";

export default function PnUpdater(eventBus, connectionDocking) {
  CommandInterceptor.call(this, eventBus);
  this._connectionDocking = connectionDocking;
  // Maintain a reference to the original this object
  that = this;

  // Crop connection ends to avoid overlapping with elements
  function cropConnection(e) {
    const context = e.context;
    const hints = context.hints || {};
    const connection = context.connection;

    if (!context.cropped && hints.createElementsBehavior !== false) {
      connection.waypoints = that.connectionWaypoints(connection.source, connection.target);
      context.cropped = true;
    }
  }

  this.executed(["connection.layout", "connection.create"], cropConnection);
}

inherits(PnUpdater, CommandInterceptor);

PnUpdater.$inject = ["eventBus", "connectionDocking"];

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
  return connection.waypoints;
}
