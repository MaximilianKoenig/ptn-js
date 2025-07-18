import PaletteModule from 'diagram-js/lib/features/palette';
import ContextPadModule from 'diagram-js/lib/features/context-pad';
import CreateModule from 'diagram-js/lib/features/create';
import SpaceToolModule from 'diagram-js/lib/features/space-tool';
import LassoToolModule from 'diagram-js/lib/features/lasso-tool';
import HandToolModule from 'diagram-js/lib/features/hand-tool';
import translate from 'diagram-js/lib/i18n/translate';
import GlobalConnectModule from 'diagram-js/lib/features/global-connect';

import PopupMenuProvider from '../popup-menu';

import CustomPaletteProvider from './CustomPaletteProvider';
import CustomContextPadProvider from './CustomContextPadProvider';

export default {
  __depends__: [
    PaletteModule,
    ContextPadModule,
    CreateModule,
    SpaceToolModule,
    LassoToolModule,
    HandToolModule,
    GlobalConnectModule,
    translate,
    PopupMenuProvider
  ],
  __init__: [ 
    'customContextPadProvider',
    'customPaletteProvider'
  ],
  customPaletteProvider: [ 'type', CustomPaletteProvider ],
  customContextPadProvider: [ 'type', CustomContextPadProvider ]
};
