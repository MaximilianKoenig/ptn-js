import PnElementFactory from "./PnElementFactory";
import PnUpdater from "./PnUpdater";
import PnLabelEditing from "./PnLabelEditing";

import CroppingConnectionDocking from 'diagram-js/lib/layout/CroppingConnectionDocking';
import CommandModule from 'diagram-js/lib/command';
import DirectEditingModule from 'diagram-js-direct-editing';
import PnModeling from "./PnModeling";

export default {
	__init__: [
		'modeling',
		'elementFactory',
		'pnUpdater',
		'pnLabelEditing'
	],
	__depends__: [
    CommandModule,
    DirectEditingModule
  ],
	elementFactory: [ 'type', PnElementFactory ],
	pnUpdater: [ 'type', PnUpdater ],
	pnLabelEditing: ['type', PnLabelEditing],
	modeling: ['type', PnModeling],
	connectionDocking: [ 'type', CroppingConnectionDocking ],
}
