import { assign } from 'min-dash';
import inherits from 'inherits';
import { is } from '../../util/Util';
import BaseElementFactory from 'diagram-js/lib/core/ElementFactory';
import { DEFAULT_LABEL_SIZE } from './LabelUtil';

export default function ElementFactory(pnElementFactory) {
  BaseElementFactory.call(this);
  this._pnElementFactory = pnElementFactory;
}

inherits(ElementFactory, BaseElementFactory);

ElementFactory.$inject = [
  'pnElementFactory',
];

ElementFactory.prototype.baseCreate = BaseElementFactory.prototype.create;

ElementFactory.prototype.create = function(elementType, attrs) {
  // Leave label creation to diagram-js
  // Assumes that a label's business object has been assigned elsewhere
  if (elementType === 'label') {
    return this.baseCreate(elementType, assign({ type: 'label' }, DEFAULT_LABEL_SIZE, attrs));
  }

  return this.createElement(elementType, attrs);
}


ElementFactory.prototype.createElement = function(elementType, attrs) {
  attrs = attrs || {};

  let businessObject = attrs.businessObject;

  if (!businessObject) {
    businessObject = this._pnElementFactory.create(attrs.type, attrs);
  }

  if (!businessObject.di) {
    if (elementType === 'root') {
      businessObject.di = this._pnElementFactory.createDiPlane(businessObject, [], {
        id: businessObject.id + '_di'
      });
    } else if (elementType === 'connection') {
      businessObject.di = this._pnElementFactory.createDiEdge(businessObject, [], {
        id: businessObject.id + '_di'
      });
    } else {
      businessObject.di = this._pnElementFactory.createDiShape(businessObject, [], {
        id: businessObject.id + '_di'
      });
    }
  }

  if (attrs.di) {
    assign(businessObject.di, attrs.di);
    delete attrs.di;
  }

  const size = this._pnElementFactory.defaultSizeForType(businessObject);

  attrs = assign({
    businessObject,
    id: businessObject.id,
  }, size, attrs);

  return this.baseCreate(elementType, attrs);
};
