import PnElementFactory from "./PnElementFactory";
import PnUpdater from "./PnUpdater";
import CroppingConnectionDocking from 'diagram-js/lib/layout/CroppingConnectionDocking';
import CommandModule from 'diagram-js/lib/command';
import DirectEditingModule from 'diagram-js-direct-editing';

export default {
	__init__: [
		'elementFactory',
		'pnUpdater',
	],
	__depends__: [
    CommandModule,
    DirectEditingModule
  ],
	elementFactory: [ 'type', PnElementFactory ],
	pnUpdater: [ 'type', PnUpdater ],
	connectionDocking: [ 'type', CroppingConnectionDocking ]
}
