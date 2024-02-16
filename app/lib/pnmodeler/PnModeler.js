import inherits from 'inherits';
import { groupBy, without, findIndex } from 'min-dash'

import Diagram from 'diagram-js';

import ConnectModule from 'diagram-js/lib/features/connect';
import ConnectionPreviewModule from 'diagram-js/lib/features/connection-preview';
import ContextPadModule from 'diagram-js/lib/features/context-pad';
import CreateModule from 'diagram-js/lib/features/create';
import LassoToolModule from 'diagram-js/lib/features/lasso-tool';
import ModelingModule from 'diagram-js/lib/features/modeling';
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas';
import MoveModule from 'diagram-js/lib/features/move';
import OutlineModule from 'diagram-js/lib/features/outline';
import PaletteModule from 'diagram-js/lib/features/palette';
import RulesModule from 'diagram-js/lib/features/rules';
import SelectionModule from 'diagram-js/lib/features/selection';
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';
import EditorActionsModule from '../common/editor-actions';
import CopyPasteModule from 'diagram-js/lib/features/copy-paste';
import GridSnappingModule from 'diagram-js/lib/features/grid-snapping';
import BendPointsModule from 'diagram-js/lib/features/bendpoints';
import KeyboardModule from '../common/keyboard';

// Modules to look into:
// import OverlaysModule from 'diagram-js/lib/features/overlays';

// Modules that might need some custom extensions:
import ResizeModule from 'diagram-js/lib/features/resize'; // might want to only allow quadratic resizing

import PaletteModule from './palette';
import PnDrawModule from './draw';
import PnModelingModule from './modeling';
import PnAutoPlaceModule from './auto-place';
import PnRulesModule from './rules';





// TODO
const exampleDiagram = ``;

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
        ResizeModule
    ];
    
    const customModules = [
        PaletteModule,
        PnDrawModule,
        PnModelingModule,
        PnAutoPlaceModule,
        PnRulesModule,
        // {
        //     moddle: ['value', new PnModdle({})],
        //     pnModeler: ['value', this]
        // }
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
    console.log("test");
}
