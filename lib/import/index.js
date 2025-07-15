import translate from 'diagram-js/lib/i18n/translate';
import CustomImporter from './CustomImporter';

export default {
  __depends__: [
      translate
  ],
  customImporter: ['type', CustomImporter]
};
