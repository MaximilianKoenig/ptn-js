// TODO: Split into renderUtil and misc util
import {some} from 'min-dash';

export function isAny(element, types) {
    return some(types, function (t) {
        return is(element, t);
    });
}

export function is(element, type) {
    var bo = getBusinessObject(element);
    return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
}

export function getBusinessObject(element) {
    return (element && element.businessObject) || element;
}

export function formatStates(states, emptyValue='<empty>', mapper= x => x.name || x) {
    return '[' + (states.length > 0 ? states.map(mapper).join(' | ') : emptyValue) + ']';
}

export function root(element) {
    return element.parent || element.$parent || element;
}

export function namespace(element) {
    return (element.businessObject || element).$type?.split(':')[0];
}

export function type(element) {
    return (element.businessObject || element).$type?.split(':')[1];
}

export function nextPosition(modeler, type) {
    const existingStates = modeler.get('elementRegistry').filter(element => is(element, type));
    const rightBorder = Math.max(... existingStates.map(element => element.x + element.width * 3 / 2));
    const topBorder = Math.min(... existingStates.map(element => element.y + element.height / 2));

    const x = (isFinite(rightBorder) ? rightBorder : 100) + 50;
    const y = isFinite(topBorder) ? topBorder : 100;

    return {x, y};
}

export function center(shape) {
    return {
      x: shape.x + shape.width / 2,
      y: shape.y + shape.height / 2
    };
}

export function elementToString(e) {
    if (!e) {
        return '<null>';
    }
  
    return '<' + e.$type + (e.id ? ' id="' + e.id : '') + '" />';
  }
  