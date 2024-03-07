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
