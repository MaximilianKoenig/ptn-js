import EditorActionsModule from "diagram-js/lib/features/editor-actions";

import EditorActions from "./EditorActions";

export default {
  __depends__: [EditorActionsModule],
  editorActions: ["type", EditorActions],
};
