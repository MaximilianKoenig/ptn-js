import SearchPadModule from "diagram-js/lib/features/search-pad";
import SearchModule from "diagram-js/lib/features/search";

import CommonSearchProvider from "./CommonSearchProvider";

export default {
  __depends__: [SearchPadModule, SearchModule],
  __init__: ["commonSearch"],
  commonSearch: ["type", CommonSearchProvider],
};
