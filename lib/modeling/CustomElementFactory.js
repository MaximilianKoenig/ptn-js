import { assign, map, pick } from 'min-dash';
import { isAny } from '../util/Util';
import { MODELER_PREFIX, MODELER_DI_PREFIX } from '../util/constants';

export default class CustomElementFactory {
	constructor(moddle) {
		this._moddle = moddle;
	}

	_needsId(element) {
		return isAny(element, [`${MODELER_PREFIX}:ModelElement`]);
	}

	_ensureId(element) {
		if (!element.id && this._needsId(element)) {
			const prefix = (element.$type || '').replace(/^[^:]*:/g, '') + '_';
			element.id = this._moddle.ids.nextPrefixed(prefix, element);
		} else if (this._moddle.ids.assigned(element.id)) {
			throw new Error('Cannot create element, id "' + element.id + '" already exists');
		}
	}

	create(elementType, attrs) {
		const element = this._moddle.create(elementType, attrs || {});
		this._ensureId(element);
		return element;
	}

	createDiBounds(bounds) {
		return this.create('dc:Bounds', bounds);
	}
	
	createDiLabel() {
		return this.create(`${MODELER_DI_PREFIX}:DiagramLabel`, {
			bounds: this.createDiBounds()
		});
	}

	createDiShape(businessObject, bounds, attrs) {
		return this.create(`${MODELER_DI_PREFIX}:DiagramShape`, assign({
			modelElement: businessObject,
			bounds: this.createDiBounds(bounds)
		}, attrs));
	}

	createDiEdge(businessObject, waypoints, attrs) {
		return this.create(`${MODELER_DI_PREFIX}:DiagramEdge`, assign({
			modelElement: businessObject,
		}, attrs));
	}

	createDiPlane(businessObject) {
		return this.create(`${MODELER_DI_PREFIX}:Plane`, {
			modelElement: businessObject
		});
	}

	createDiWaypoints(waypoints) {
		const self = this;
		return map(waypoints, function (waypoint) {
			return self.createDiWaypoint(waypoint);
		});
	}

	createDiWaypoint(waypoint) {
		return this.create('dc:Point', pick(waypoint, ['x', 'y']));
	}

	defaultSizeForType(element) {
		return { width: 50, height: 50 };
	}
}

CustomElementFactory.$inject = ['moddle'];
