import { is } from '../util/Util';
import { getLabelAttribute, existsExternalLabel, setLabel, requiresExternalLabel, getExternalLabelMid, getLabel, isLabel } from './LabelUtil';
import { MODELER_PREFIX } from '../util/constants';

export default class UpdateLabelHandler {
  constructor(modeling, textRenderer) {
    this._modeling = modeling;
    this._textRenderer = textRenderer;
  }
  setText(element, text, oldText = '') {

    // CustomModelerTodo: Add custom logic here to handle label text changes.
    // In the example, arc labels are restricted to integers.
    if (text !== null && is(element, `${MODELER_PREFIX}:Arc`)) {
      if (!(/^\d+$/.test(text))) {
        text = oldText;
      }
    }

    const editedAttribute = getLabelAttribute(element);
    const label = element.labels.filter(label => label.labelAttribute === editedAttribute)[0] || element.label || element;
    const labelTarget = element.labelTarget || element;

    setLabel(label, text);

    return [label, labelTarget];
  }

  preExecute(context) {
    const { element, newLabel } = context;
    const businessObject = element.businessObject;

    // Create external label if necessary
    if (!isLabel(element)
      && !isEmptyText(newLabel)
      && !existsExternalLabel(element)
      && requiresExternalLabel(element)
    ) {
      const paddingTop = 7;
      let labelCenter = getExternalLabelMid(element);
      labelCenter = {
        x: labelCenter.x,
        y: labelCenter.y + paddingTop
      };
      this._modeling.createLabel(element, labelCenter, {
        id: businessObject.id + '_label',
        businessObject: businessObject
      });
    }
  }

  execute(context) {
    const { element, newLabel } = context;
    const oldLabel = getLabel(element);
    context.oldLabel = oldLabel;
    return this.setText(element, newLabel, oldLabel);
  }

  postExecute(context) {
    let { element, newLabel, newBounds } = context;
    const hints = context.hints || {};
    const label = element.label || element;
  
    // Ignore internal labels
    if(!isLabel(label)) {
      return;
    }
  
    // Remove now empty labels
    if (isLabel(label) && isEmptyText(newLabel)) {
      if (hints.removeShape !== false) {
        this._modeling.removeShape(label, { unsetLabel: false });
      }
      // Set default weight of 1
      this.setText(element, '1');
      return;
    }
  
    const text = getLabel(label);
  
    // resize element based on label _or_ pre-defined bounds
    if (typeof newBounds === 'undefined') {
      newBounds = this._textRenderer.getExternalLabelBounds(label, text);
    }
  
    // setting newBounds to false or _null_ will
    // disable the postExecute resize operation
    if (newBounds) {
      this._modeling.resizeShape(label, newBounds, { width: 0, height: 0 })
    }
  }

  revert(context) {
    const { element, oldLabel } = context;
    return this.setText(element, oldLabel)
  }
}

UpdateLabelHandler.$inject = [
  'modeling',
  'textRenderer'
];

function isEmptyText(text) {
  return !text || !text.trim();
}