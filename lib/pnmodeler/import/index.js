import translate from 'diagram-js/lib/i18n/translate';
import PnImporter from './PnImporter';

export default {
  __depends__: [
      translate
  ],
  pnImporter: ['type', PnImporter]
};
