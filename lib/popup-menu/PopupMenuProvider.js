import { is } from "../util/Util";
import { MODELER_PREFIX } from "../util/constants";

export default class PopupMenuProvider {
  constructor(popupMenu, commandStack, translate) {
    this._popupMenu = popupMenu;
    this._commandStack = commandStack;
    this._translate = translate;

    popupMenu.registerProvider("replace-transition", this);
  }

  getPopupMenuEntries(element) {
    if (!is(element, `${MODELER_PREFIX}:Transition`)) {
      return {};
    }
    // Required to avoid losing the context when called.
    const commandStack = this._commandStack;

    function changeTransitionType(x) {
      commandStack.execute("element.updateProperty", {
        element,
        propertyName: "isSilent",
        newValue: !element.businessObject.isSilent,
        hints: { rerender: true },
      });
    }

    const actions = {};
    const isSilent = element.businessObject.isSilent;

    if (isSilent) {
      actions["replace-silent-transition"] = {
        label: this._translate(`Change to normal transition`),
        className: "pn-icon-transition",
        action: changeTransitionType,
      };
    } else {
      actions["replace-transition"] = {
        label: this._translate(`Change to silent transition`),
        className: "pn-icon-silent-transition",
        action: changeTransitionType,
      };
    }

    return actions;
  }
}

PopupMenuProvider.$inject = ["popupMenu", "commandStack", "translate"];
