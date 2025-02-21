import CustomRenderer from './CustomRenderer';
import TextRenderer from './TextRenderer';

export default {
  __init__: [ 'customRenderer' ],
  customRenderer: [ 'type', CustomRenderer ],
  textRenderer: [ 'type', TextRenderer]
};
