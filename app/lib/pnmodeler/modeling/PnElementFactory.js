import BaseElementFactory from 'diagram-js/lib/core/ElementFactory';
import inherits from 'inherits';
import { assign } from 'min-dash';
import Ids from 'ids';

export default function PnElementFactory(moddle, elementRegistry) {
	BaseElementFactory.call(this);
	this._moddle = moddle;
	this._elementRegistry = elementRegistry;
	this._ids = new Ids();
}

inherits(PnElementFactory, BaseElementFactory);

PnElementFactory.$inject = [
	'moddle',
	'elementRegistry'
];

PnElementFactory.prototype.baseCreate = BaseElementFactory.prototype.create;
PnElementFactory.prototype.baseCreateShape = BaseElementFactory.prototype.createShape;

PnElementFactory.prototype.defaultSizeForType = function (type) {
	return { width: 50, height: 50 };
};

PnElementFactory.prototype.createShape = function (attrs) {
	attrs = assign(this.defaultSizeForType(attrs.type), attrs);
	return this.baseCreateShape(attrs);
}

PnElementFactory.prototype.create = function (elementType, attrs) {
	attrs = attrs || {};
	attrs = assign(this.defaultSizeForType(attrs.type), attrs);

	// let businessObject = attrs.businessObject;

	// if (!businessObject) {
	//     if (!attrs.type) {
	//         throw new Error('no element type specified');
	//     }
	//     let businessAttrs = assign({}, attrs);
	//     delete businessAttrs.width;
	//     delete businessAttrs.height;
	//     businessObject = this.createBusinessObject(businessAttrs.type, businessAttrs);
	// }

	// attrs = assign({
	//     businessObject: businessObject,
	//     id: businessObject.id
	// }, attrs);

	return this.baseCreate(elementType, attrs);
}
