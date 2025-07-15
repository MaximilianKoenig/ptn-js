import { getBusinessObject } from '../../util/Util';
import {
  forEach,
  isArray,
  isUndefined,
  omit,
  reduce
} from 'min-dash';

function copyProperties(source, target, properties) {
  if (!isArray(properties)) {
    properties = [ properties ];
  }

  forEach(properties, function(property) {
    if (!isUndefined(source[property])) {
      target[property] = source[property];
    }
  });
}

function removeProperties(element, properties) {
  if (!isArray(properties)) {
    properties = [ properties ];
  }

  forEach(properties, function(property) {
    if (element[property]) {
      delete element[property];
    }
  });
}

const LOW_PRIORITY = 750;

export default function CommonCopyPaste(customElementFactory, eventBus, moddleCopy) {

  eventBus.on('copyPaste.copyElement', LOW_PRIORITY, function(context) {
    const { descriptor, element } = context;

    const businessObject = descriptor.oldBusinessObject = getBusinessObject(element);

    descriptor.type = element.type;

    copyProperties(businessObject, descriptor, 'name');

    descriptor.di = {};

    // fill and stroke will be set to DI
    copyProperties(businessObject.di, descriptor.di, [
      'fill',
      'stroke'
    ]);

    if (isLabel(descriptor)) {
      return descriptor;
    }

  });

  let references;

  function resolveReferences(descriptor, cache) {
    const businessObject = getBusinessObject(descriptor);

    // default sequence flows
    if (descriptor.default) {

      // relationship cannot be resolved immediately
      references[ descriptor.default ] = {
        element: businessObject,
        property: 'default'
      };
    }

    references = omit(references, reduce(references, function(array, reference, key) {
      const { element, property } = reference;

      if (key === descriptor.id) {
        element[ property ] = businessObject;

        array.push(descriptor.id);
      }

      return array;
    }, []));
  }

  eventBus.on('copyPaste.pasteElements', function() {
    references = {};
  });

  eventBus.on('copyPaste.pasteElement', function(context) {
    const { cache, descriptor } = context;
    const oldBusinessObject = descriptor.oldBusinessObject;
    let newBusinessObject;

    // do NOT copy business object if external label
    if (isLabel(descriptor)) {
      descriptor.businessObject = getBusinessObject(cache[ descriptor.labelTarget ]);
      return;
    }

    newBusinessObject = customElementFactory.create(oldBusinessObject.$type);

    descriptor.businessObject = moddleCopy.copyElement(
      oldBusinessObject,
      newBusinessObject
    );

    resolveReferences(descriptor, cache);

    copyProperties(descriptor, newBusinessObject, [
      'color',
      'name'
    ]);

    removeProperties(descriptor, 'oldBusinessObject');
  });

}

CommonCopyPaste.$inject = [
  'customElementFactory',
  'eventBus',
  'moddleCopy'
];

// helpers //////////

function isLabel(element) {
  return !!element.labelTarget;
}
