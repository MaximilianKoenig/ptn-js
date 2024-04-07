import inherits from 'inherits';
import { groupBy, without, findIndex } from 'min-dash'

import Diagram from 'diagram-js';

// diagram-js modules
import TouchModule from 'diagram-js/lib/navigation/touch';
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas';

import BendPointsModule from 'diagram-js/lib/features/bendpoints';
import ConnectModule from 'diagram-js/lib/features/connect';
import ConnectionPreviewModule from 'diagram-js/lib/features/connection-preview';
import ContextPadModule from 'diagram-js/lib/features/context-pad';
import CopyPasteModule from 'diagram-js/lib/features/copy-paste';
import CreateModule from 'diagram-js/lib/features/create';
import EditorActionsModule from '../common/editor-actions';
import GridSnappingModule from 'diagram-js/lib/features/grid-snapping';
import KeyboardMoveSelectionModule from 'diagram-js/lib/features/keyboard-move-selection';
import LassoToolModule from 'diagram-js/lib/features/lasso-tool';
import ModelingModule from 'diagram-js/lib/features/modeling';
import MoveModule from 'diagram-js/lib/features/move';
import OutlineModule from 'diagram-js/lib/features/outline';
import PaletteModule from 'diagram-js/lib/features/palette';
import RulesModule from 'diagram-js/lib/features/rules';
import SelectionModule from 'diagram-js/lib/features/selection';
import SnappingModule from 'diagram-js/lib/features/snapping';

// Custom common Modules
import KeyboardModule from '../common/keyboard';

// Modules to look into:
// import OverlaysModule from 'diagram-js/lib/features/overlays';

// Not sure what they do
// import AlignElementsModule from 'diagram-js/lib/features/align-elements';

// Seems unnecessary
// import AutoScrollModule from 'diagram-js/lib/features/auto-scroll';

// TODO
// Create viewer and navigated viewers!

// Modules that might need some custom extensions:
import ResizeModule from 'diagram-js/lib/features/resize'; // might want to only allow quadratic resizing


// Modules that might become (parameterized) custom common modules
import PnAutoPlaceModule from './auto-place';

// Modeler-specific modules
import PaletteModule from './palette';
import PnDrawModule from './draw';
import PnModelingModule from './modeling';
import PnRulesModule from './rules';
import PnModdle from './moddle';





// TODO
const emptyDiagram =
    `<?xml version="1.0" encoding="UTF-8"?>
<ptn:definitions xmlns:ptn="http://bpt-lab.org/schemas/ptn" xmlns:ptnDi="http://bpt-lab.org/schemas/ptnDi" xmlns:dc="https://www.omg.org/spec/BPMN/20100501/DC.xsd">
    <ptn:ptNet id="ptNet_1" name="Place Transition Net 1">
    </ptn:ptNet>
    <ptnDi:ptnDiagram id="ptNet_1_di">
    <ptnDi:ptnPlane id="ptNet_1_plane" ptNet="ptNet_1">
    </ptnDi:ptnPlane>
    </ptnDi:ptnDiagram>
</ptn:definitions>`;

export default function PnModeler(options) {
    const {
        container,
        additionalModules = [],
        keyboard
    } = options;

    const builtinModules = [
        ConnectModule,
        ConnectionPreviewModule,
        ContextPadModule,
        CreateModule,
        LassoToolModule,
        ModelingModule,
        MoveCanvasModule,
        MoveModule,
        OutlineModule,
        PaletteModule,
        RulesModule,
        SelectionModule,
        ZoomScrollModule,
        EditorActionsModule,
        KeyboardModule,
        CopyPasteModule,
        GridSnappingModule,
        BendPointsModule,
        ResizeModule,
        SnappingModule,
        TouchModule,
        KeyboardMoveSelectionModule
    ];
    
    const customModules = [
        PaletteModule,
        PnDrawModule,
        PnModelingModule,
        PnAutoPlaceModule,
        PnRulesModule,
        {
            moddle: ['value', new PnModdle({})],
            pnModeler: ['value', this]
        }
    ];

    const diagramOptions = {
        canvas: {
            container
        },
        keyboard,
        modules: [
            ...builtinModules,
            ...customModules,
            ...additionalModules
        ]
    };

    Diagram.call(this, diagramOptions);

    this.get('eventBus').fire('attach'); // Needed for key listeners to work
}

inherits(PnModeler, Diagram);

PnModeler.prototype.createNew = function () {
    return this.importXML(emptyDiagram);
}

PnModeler.prototype.importXML = function (xml) {
    const self = this;
    console.log(xml);

    return new Promise(function (resolve, reject) {
        // hook in pre-parse listeners +
        // allow xml manipulation
        xml = self._emit('import.parse.start', {xml: xml}) || xml;
        console.log(self.get('moddle'));

        self.get('moddle').fromXML(xml, 'ptn:Definitions').then(function (result) {
            let definitions = result.rootElement;
            const { references, warnings, elementsById } = result;
            console.log(result);

            const context = {
                references,
                elementsById,
                warnings
            };

            // for (let id in elementsById) {
            //     self.get('elementFactory')._ids.claim(id, elementsById[id]);
            // }

            definitions = self._emit('import.parse.complete', {
                definitions,
                context
            }) || definitions;

            console.log(definitions);
            self.importDefinitions(definitions);
            self._emit('import.done', {error: null, warnings: null});
            resolve();
        }).catch(function (err) {

            self._emit('import.parse.failed', {
                error: err
            });

            self._emit('import.done', {error: err, warnings: err.warnings});

            return reject(err);
        });
    });
}

PnModeler.prototype.importDefinitions = function (definitions) {
    // this.get('elementFactory')._ids.clear();
    this._definitions = definitions;
    this._emit('import.render.start', {definitions: definitions});
    // this.showPn(definitions.petriNets[0]);
    // this._emit('import.render.complete', {});
}

// PnModeler.prototype.showPn = function (petriNet) {
//     this.clear();
//     this._petriNet = petriNet;
//     if (petriNet) {
//         const elementFactory = this.get('elementFactory');
//         const daigramRoot = elementFactory.createRoot({ type: 'ptn:PetriNet', businessObject: petriNet });
//         const canvas = this.get('canvas');
//         canvas.setRootElement(daigramRoot);

//         const elements = groupBy(petriNet.get('Elements'), element => element.$type);
//         const places = {};
//         const transitions = {};

//         (elements['ptn:Place'] || []).forEach(place => {
//             const placeVisual = elementFactory.createShape({
//                 type: 'ptn:Place',
//                 businessObject: place,
//                 x: parseInt(place.get('x')),
//                 y: parseInt(place.get('y'))
//             });
//             places[place.id] = placeVisual;
//             canvas.addShape(placeVisual, daigramRoot);
//         });

//         (elements['ptn:Transition'] || []).forEach(transition => {
//             const transitionVisual = elementFactory.createShape({
//                 type: 'ptn:Transition',
//                 businessObject: transition,
//                 x: parseInt(transition.get('x')),
//                 y: parseInt(transition.get('y'))
//             });
//             transitions[transition.id] = transitionVisual;
//             canvas.addShape(transitionVisual, daigramRoot);
//         });

//         (elements['ptn:Arc'] || []).forEach(arc => {
//             const sourceId = arc.get('source').get('id');
//             const targetId = arc.get('target').get('id');

//             const source = places[sourceId] || transitions[sourceId];
//             const target = places[targetId] || transitions[targetId];
            
//             const arcVisual = elementFactory.createConnection({
//                 type: 'ptn:Arc',
//                 businessObject: arc,
//                 source,
//                 target,
//                 waypoints: this.get('pnUpdater').connectionWaypoints(source, target)
//             });
//             canvas.addConnection(arcVisual, daigramRoot);
//         });
//     }
// }

PnModeler.prototype.saveXML = function (options) {
    options = options || {};

    const self = this;

    let definitions = this._definitions;

    return new Promise(function (resolve, reject) {

        if (!definitions) {
            const err = new Error('no xml loaded');

            return reject(err);
        }

        // allow to fiddle around with definitions
        definitions = self._emit('saveXML.start', {
            definitions: definitions
        }) || definitions;

        self.get('moddle').toXML(definitions, options).then(function (result) {
            const xml = result.xml;
            // try {
            //     xml = self._emit('saveXML.serialized', {
            //         error: null,
            //         xml: xml
            //     }) || xml;

            //     self._emit('saveXML.done', {
            //         error: null,
            //         xml: xml
            //     });
            // } catch (e) {
            //     console.error('error in saveXML life-cycle listener', e);
            // }
            return resolve({xml: xml});
        }).catch(function (err) {
            return reject(err);
        });
    });
};

PnModeler.prototype._emit = function (type, event) {
    return this.get('eventBus').fire(type, event);
};
