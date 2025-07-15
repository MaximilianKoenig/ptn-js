import { assign } from 'min-dash';
import { is, elementToString } from '../util/Util';
import { getExternalLabelBounds, getLabel, requiresExternalLabel } from '../modeling/LabelUtil';
import { getMid } from 'diagram-js/lib/layout/LayoutUtil';
import { MODELER_DI_PREFIX } from '../util/constants';

function elementData(semantic, attrs) {
    return assign({
        id: semantic.id,
        type: semantic.$type,
        businessObject: semantic
    }, attrs);
}

function notYetDrawn(translate, semantic, refSemantic, property) {
    return new Error(translate('element {element} referenced by {referenced}#{property} not yet drawn', {
        element: elementToString(refSemantic),
        referenced: elementToString(semantic),
        property: property
    }));
}


/**
 * An importer that adds diagram elements to the canvas
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {ElementFactory} elementFactory
 * @param {ElementRegistry} elementRegistry
 * @param {Function} translate
 * @param {TextRenderer} textRenderer
 */
export default class CustomImporter {
    constructor(eventBus, canvas, elementFactory,
        elementRegistry, translate, textRenderer) {

        this._eventBus = eventBus;
        this._canvas = canvas;
        this._elementFactory = elementFactory;
        this._elementRegistry = elementRegistry;
        this._translate = translate;
        this._textRenderer = textRenderer;
    }
    /**
     * Add model element (semantic) to the canvas onto the
     * specified parent shape.
     */
    add(semantic, parentElement) {
        const di = semantic.di;
        let element;
        const translate = this._translate;
        let hidden;
        let parentIndex;

        // ROOT ELEMENT
        // handle the special case that we deal with an
        // invisible root element
        if (is(di, `${MODELER_DI_PREFIX}:Plane`)) {
            // add a virtual element (not being drawn)
            element = this._elementFactory.createRoot(elementData(semantic));
            this._canvas.setRootElement(element);
        }

        // SHAPE
        else if (is(di, `${MODELER_DI_PREFIX}:DiagramShape`)) {
            const isFrame = isFrameElement(semantic);
            hidden = parentElement && (parentElement.hidden || parentElement.collapsed);
            const bounds = semantic.di.bounds;

            element = this._elementFactory.createShape(elementData(semantic, {
                hidden: hidden,
                x: Math.round(bounds.x),
                y: Math.round(bounds.y),
                width: Math.round(bounds.width),
                height: Math.round(bounds.height),
                isFrame: isFrame
            }));

            this._canvas.addShape(element, parentElement, parentIndex);
        }

        // CONNECTION
        else if (is(di, `${MODELER_DI_PREFIX}:DiagramEdge`)) {
            const source = this._getSource(semantic);
            const target = this._getTarget(semantic);

            hidden = parentElement && (parentElement.hidden || parentElement.collapsed);

            element = this._elementFactory.createConnection(elementData(semantic, {
                hidden: hidden,
                source: source,
                target: target,
                waypoints: getWaypoints(semantic, source, target)
            }));

            this._canvas.addConnection(element, parentElement, 0);
        } else {
            throw new Error(translate('unknown di {di} for element {semantic}', {
                di: elementToString(di),
                semantic: elementToString(semantic)
            }));
        }

        // (optional) LABEL
        if (requiresExternalLabel(semantic) && getLabel(semantic)) {
            //TODO this could be done nicer without explicitely setting labelAttribute
            this.addLabel(semantic, element);
        }

        this._eventBus.fire('diagramElement.added', { element: element });

        return element;
    }

    /**
     * add label for an element
     */
    addLabel(semantic, element) {
        const text = getLabel(element);
        let bounds = getExternalLabelBounds(semantic, element);

        if (text || text === '') {
            // get corrected bounds from actual layouted text
            bounds = this._textRenderer.getExternalLabelBounds(bounds, text);
        }

        const label = this._elementFactory.createLabel(elementData(semantic, {
            id: semantic.id + '_label' + '_' + semantic.labelAttribute,
            labelTarget: element,
            labelAttribute: semantic.labelAttribute,
            type: 'label',
            hidden: element.hidden || false,
            x: Math.round(bounds.x),
            y: Math.round(bounds.y),
            width: Math.round(bounds.width),
            height: Math.round(bounds.height)
        }));

        return this._canvas.addShape(label, element.parent);
    }

    /**
     * Return the drawn connection end based on the given side.
     *
     * @throws {Error} if the end is not yet drawn
     */
    _getEnd(semantic, side) {
        const refSemantic = semantic[side];
        const element = refSemantic && this._getElement(refSemantic);

        if (element) {
            return element;
        }

        if (refSemantic) {
            throw notYetDrawn(this._translate, semantic, refSemantic, side + 'Ref');
        } else {
            throw new Error(this._translate('{semantic}#{side} Ref not specified', {
                semantic: elementToString(semantic),
                side: side
            }));
        }
    }

    _getSource(semantic) {
        return this._getEnd(semantic, 'source');
    }

    _getTarget(semantic) {
        return this._getEnd(semantic, 'target');
    }

    _getElement(semantic) {
        return this._elementRegistry.get(semantic.id);
    }
}

CustomImporter.$inject = [
    'eventBus',
    'canvas',
    'elementFactory',
    'elementRegistry',
    'translate',
    'textRenderer'
];

// helpers //////////

function getWaypoints(bo, source, target) {
    const waypoints = bo.di.waypoint;

    if (!waypoints || waypoints.length < 2) {
        return [getMid(source), getMid(target)];
    }

    return waypoints.map(function (p) {
        return {x: p.x, y: p.y};
    });
}

// Might become relevant if we include hierarchical elements
function isFrameElement(semantic) {
    return false;
}
