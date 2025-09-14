import { getLabel, isLabel } from "../../modeling/LabelUtil";

/**
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 * @typedef {import('diagram-js/lib/features/search-pad/SearchPad').default} SearchPad
 *
 * @typedef {import('diagram-js/lib/features/search-pad/SearchPadProvider').default} SearchPadProvider
 * @typedef {import('diagram-js/lib/features/search-pad/SearchPadProvider').SearchResult} SearchPadResult
 * @typedef {import('diagram-js/lib/features/search-pad/SearchPadProvider').Token} SearchPadToken
 * @typedef {import('diagram-js/lib/features/search/search').default} Search
 * @typedef {import('diagram-js/lib/features/search/search').SearchResult} SearchResult
 * @typedef {import('diagram-js/lib/features/search/search').Token} SearchToken
 */

/**
 * Provides ability to search for elements.
 *
 * @implements {SearchPadProvider}
 *
 * @param {ElementRegistry} elementRegistry
 * @param {SearchPad} searchPad
 * @param {Canvas} canvas
 * @param {Search} search
 */
export default class CommonSearchProvider {
  constructor(elementRegistry, searchPad, canvas, search) {
    this._elementRegistry = elementRegistry;
    this._canvas = canvas;
    this._search = search;

    searchPad.registerProvider(this);
  }

  /**
   * @param {string} pattern
   *
   * @return {SearchPadResult[]}
   */
  find(pattern) {
    const rootElements = this._canvas.getRootElements();

    const elements = this._elementRegistry.filter(function (element) {
      return !isLabel(element) && !rootElements.includes(element);
    });

    const searchItems = elements.map((element) => {
      return {
        element,
        label: getLabel(element),
        id: element.id,
      };
    });

    return this._search(searchItems, pattern, {
      keys: ["label", "id"],
    }).map(toSearchPadResult);
  }
}

CommonSearchProvider.$inject = [
  "elementRegistry",
  "searchPad",
  "canvas",
  "search",
];

/**
 * @param {SearchResult} token
 *
 * @return {SearchPadResult}
 */
function toSearchPadResult(result) {
  const {
    item: { element },
    tokens,
  } = result;

  return {
    element,
    primaryTokens: tokens.label,
    secondaryTokens: tokens.id,
  };
}
