import PopupMenuModule from "diagram-js/lib/features/popup-menu";

import PopupMenuProvider from "./PopupMenuProvider";

export default {
  __depends__: [PopupMenuModule],
  __init__: ["popupMenuProvider"],
  popupMenuProvider: ["type", PopupMenuProvider],
};
