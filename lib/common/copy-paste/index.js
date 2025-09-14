import CopyPasteModule from "diagram-js/lib/features/copy-paste";

import CommonCopyPaste from "./CommonCopyPaste";
import ModdleCopy from "./ModdleCopy";

export default {
  __depends__: [CopyPasteModule],
  __init__: ["commonCopyPaste", "moddleCopy"],
  commonCopyPaste: ["type", CommonCopyPaste],
  moddleCopy: ["type", ModdleCopy],
};
