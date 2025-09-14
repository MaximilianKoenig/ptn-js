import { assign } from "min-dash";
import BaseElementFactory from "diagram-js/lib/core/ElementFactory";
import { DEFAULT_LABEL_SIZE } from "./LabelUtil";

export default class ElementFactory extends BaseElementFactory {
  constructor(customElementFactory) {
    super();
    this._customElementFactory = customElementFactory;
  }

  baseCreate(elementType, attrs) {
    return super.create(elementType, attrs);
  }

  create(elementType, attrs) {
    // Leave label creation to diagram-js
    // Assumes that a label's business object has been assigned elsewhere
    if (elementType === "label") {
      return this.baseCreate(
        elementType,
        assign({ type: "label" }, DEFAULT_LABEL_SIZE, attrs),
      );
    }

    return this.createElement(elementType, attrs);
  }

  createElement(elementType, attrs) {
    attrs = attrs || {};

    let businessObject = attrs.businessObject;

    if (!businessObject) {
      businessObject = this._customElementFactory.create(attrs.type, attrs);
    }

    if (!businessObject.di) {
      if (elementType === "root") {
        businessObject.di = this._customElementFactory.createDiPlane(
          businessObject,
          [],
          {
            id: businessObject.id + "_di",
          },
        );
      } else if (elementType === "connection") {
        businessObject.di = this._customElementFactory.createDiEdge(
          businessObject,
          [],
          {
            id: businessObject.id + "_di",
          },
        );
      } else {
        businessObject.di = this._customElementFactory.createDiShape(
          businessObject,
          [],
          {
            id: businessObject.id + "_di",
          },
        );
      }
    }

    if (attrs.di) {
      assign(businessObject.di, attrs.di);
      delete attrs.di;
    }

    const size = this._customElementFactory.defaultSizeForType(businessObject);

    attrs = assign(
      {
        businessObject,
        id: businessObject.id,
      },
      size,
      attrs,
    );

    return this.baseCreate(elementType, attrs);
  }
}

ElementFactory.$inject = ["customElementFactory"];
