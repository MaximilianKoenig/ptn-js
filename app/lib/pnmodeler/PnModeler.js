import inherits from 'inherits';

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
import TranslateModule from 'diagram-js/lib/i18n/translate';

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
import PnCoreModule from './core';
import PnModelingModule from './modeling';
import PnRulesModule from './rules';
import PnModdle from './moddle';
import { importPnDiagram } from './import/Importer';





// TODO
const emptyDiagram =
    `<?xml version="1.0" encoding="UTF-8"?>
<ptn:definitions xmlns:ptn="http://bpt-lab.org/schemas/ptn" xmlns:ptnDi="http://bpt-lab.org/schemas/ptnDi" xmlns:dc="https://www.omg.org/spec/BPMN/20100501/DC.xsd">
    <ptn:ptNet id="ptNet_1" name="Place Transition Net 1">
        <ptn:place id="place_1" name="place_1" marking="1"/>
    </ptn:ptNet>
    <ptnDi:ptnDiagram id="ptNet_1_di">
        <ptnDi:ptnPlane id="ptNet_1_plane" ptnElement="ptNet_1">
        <ptnDi:ptnShape id="place_1_di" ptnElement="place_1">
            <dc:Bounds x="100" y="100" width="50" height="50"/>
            <ptnDi:label>
            <dc:Bounds x="100" y="100" width="50" height="50"/>
        </ptnDi:label>
      </ptnDi:ptnShape>
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
        KeyboardMoveSelectionModule,
        TranslateModule
    ];
    
    const customModules = [
        PaletteModule,
        PnCoreModule,
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

    return new Promise(function (resolve, reject) {
        // hook in pre-parse listeners +
        // allow xml manipulation
        xml = self._emit('import.parse.start', {xml: xml}) || xml;

        const moddle = self.get('moddle');

        console.log(moddle);
        moddle.ids.clear();

        moddle.fromXML(xml, 'ptn:Definitions').then(function (result) {
            let definitions = result.rootElement;
            const { references, warnings, elementsById } = result;
            console.log(result);

            const context = {
                references,
                elementsById,
                warnings
            };

            definitions = self._emit('import.parse.complete', {
                definitions,
                context
            }) || definitions;

            self.importDefinitions(definitions);
            self.collectIds(moddle, elementsById);

            self._emit('import.render.start', {definitions: definitions});
            self.showPn(definitions);
            self._emit('import.render.complete', {});

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

PnModeler.prototype.importDefinitions = function (definitions, elementsById) {
    this._definitions = definitions;
}

PnModeler.prototype.collectIds = function (moddle, elementsById) {
    for (let id in elementsById) {
        moddle.ids.claim(id, elementsById[id]);
    }
}

PnModeler.prototype.showPn = function(definitions) {
    this.clear();

    // We currently assume that we only import single diagrams
    const rootDiagram = definitions.ptnDiagrams[0];
    importPnDiagram(this, definitions, rootDiagram);
}

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
            let xml = result.xml;
            try {
                xml = self._emit('saveXML.serialized', {
                    error: null,
                    xml: xml
                }) || xml;

                self._emit('saveXML.done', {
                    error: null,
                    xml: xml
                });
            } catch (e) {
                console.error('error in saveXML life-cycle listener', e);
            }
            return resolve({xml: xml});
        }).catch(function (err) {
            return reject(err);
        });
    });
};

PnModeler.prototype._emit = function (type, event) {
    return this.get('eventBus').fire(type, event);
};
