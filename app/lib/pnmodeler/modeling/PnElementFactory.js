import { assign, map } from 'min-dash';
import { isAny } from '../../util/Util';


export default function PnElementFactory(moddle) {
	this._moddle = moddle;
}

PnElementFactory.$inject = ['moddle'];

PnElementFactory.prototype._needsId = function(element) {
	return isAny(element, ['ptn:PtnElement']);
}

PnElementFactory.prototype._ensureId = function(element) {
	if (!element.id && this._needsId(element)) {
		const prefix = (element.$type || '').replace(/^[^:]*:/g, '') + '_';
		element.id = this._moddle.ids.nextPrefixed(prefix, element);
	} else if (this._moddle.ids.assigned(element.id)) {
		throw new Error('Cannot create element, id "' + element.id + '" already exists');
	}
}

PnElementFactory.prototype.create = function(elementType, attrs) {
	const element = this._moddle.create(elementType, attrs || {});
	this._ensureId(element);
	return element;
}

PnElementFactory.prototype.createDiBounds = function(bounds) {
	return this.create('dc:Bounds', bounds);
}

PnElementFactory.prototype.createDiLabel = function(shape) {
	return this.create('ptnDi:PtnLabel', {
		bounds: this.createDiBounds()
	});
}

PnElementFactory.prototype.createDiShape = function(businessObject, bounds, attrs) {
	return this.create('ptnDi:PtnShape', assign({
		ptnElement: businessObject,
		bounds: this.createDiBounds(bounds)
	}, attrs));
}

PnElementFactory.prototype.createDiEdge = function(businessObject, waypoints, attrs) {
	return this.create('ptnDi:PtnEdge', assign({
		ptnElement: businessObject,
	}, attrs));
}

PnElementFactory.prototype.createDiPlane = function(businessObject) {
	return this.create('ptnDi:PtnPlane', {
		ptnElement: businessObject
	});
}

PnElementFactory.prototype.createDiWaypoints = function(waypoints) {
	const self = this;
	return map(waypoints, function(waypoint) {
		return self.createDiWaypoint(waypoint);
	});
}

PnElementFactory.prototype.createDiWaypoint = function(waypoint) {
	return this.create('dc:Point', pick(waypoint, ['x', 'y']));
}
