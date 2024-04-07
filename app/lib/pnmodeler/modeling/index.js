import PnElementFactory from "./PnElementFactory";
import PnUpdater from "./PnUpdater";
import PnLabelEditing from "./PnLabelEditing";

import CroppingConnectionDocking from 'diagram-js/lib/layout/CroppingConnectionDocking';
import CommandModule from 'diagram-js/lib/command';
import LabelSupportModule from 'diagram-js/lib/features/label-support';
import AttachSupportModule from 'diagram-js/lib/features/attach-support';
import DirectEditingModule from 'diagram-js-direct-editing';
import PnModeling from "./PnModeling";
import ElementFactory from "./ElementFactory";

export default {
	__init__: [
		'modeling',
		'elementFactory',
		'pnUpdater',
		'pnLabelEditing'
	],
	__depends__: [
    CommandModule,
    DirectEditingModule,
		LabelSupportModule,
		AttachSupportModule
  ],
	elementFactory: [ 'type', ElementFactory ],
	pnElementFactory: [ 'type', PnElementFactory ],
	pnUpdater: [ 'type', PnUpdater ],
	pnLabelEditing: ['type', PnLabelEditing],
	modeling: ['type', PnModeling],
	connectionDocking: [ 'type', CroppingConnectionDocking ],
}
