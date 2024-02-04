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
// import ResizeModule from 'diagram-js/lib/features/resize';
import RulesModule from 'diagram-js/lib/features/rules';
import SelectionModule from 'diagram-js/lib/features/selection';
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';
import EditorActionsModule from '../common/editor-actions';
import CopyPasteModule from 'diagram-js/lib/features/copy-paste';
import KeyboardModule from '../common/keyboard';

import PaletteModule from './palette';





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
        CopyPasteModule
    ];
    
    const customModules = [
        PaletteModule,
        // PnDrawModule,
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
