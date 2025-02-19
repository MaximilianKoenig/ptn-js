import { is } from '../../util/Util';
import { getLabelAttribute, existsExternalLabel, setLabel, requiresExternalLabel, getExternalLabelMid, getLabel, isLabel } from './LabelUtil';

export default function UpdateLabelHandler(modeling, textRenderer) {
  function setText(element, text, oldText = '') {

    // TODO: Add an explicit warning to the user
    if (text !== null && is(element, 'ptn:Arc')) {
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

  function preExecute(context) {
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
      modeling.createLabel(element, labelCenter, {
        id: businessObject.id + '_label',
        businessObject: businessObject
      });
    }
  }

  function execute(context) {
    const { element, newLabel } = context;
    const oldLabel = getLabel(element);
    context.oldLabel = oldLabel;
    return setText(element, newLabel, oldLabel);
  }

  function postExecute(context) {
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
        modeling.removeShape(label, { unsetLabel: false });
      }
      // Set default weight of 1
      setText(element, '1');
      return;
    }
  
    const text = getLabel(label);
  
    // resize element based on label _or_ pre-defined bounds
    if (typeof newBounds === 'undefined') {
      newBounds = textRenderer.getExternalLabelBounds(label, text);
    }
  
    // setting newBounds to false or _null_ will
    // disable the postExecute resize operation
    if (newBounds) {
      modeling.resizeShape(label, newBounds, { width: 0, height: 0 })
    }
  }

  function revert(context) {
    const { element, oldLabel } = context;
    return setText(element, oldLabel)
  }

  this.preExecute = preExecute;
  this.execute = execute;
  this.postExecute = postExecute;
  this.revert = revert;
}

UpdateLabelHandler.$inject = [
  'modeling',
  'textRenderer'
];

function isEmptyText(text) {
  return !text || !text.trim();
}