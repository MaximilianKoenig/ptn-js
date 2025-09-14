import Ids from "ids";
import { assign, isString } from "min-dash";
import { Moddle } from "moddle";
import { Reader, Writer } from "moddle-xml";
import { MODELER_PREFIX } from "../util/constants";

/**
 * A sub class of {@link Moddle} with support for import and export of xml files.
 *
 * @class CustomModdle
 *
 * @extends Moddle
 *
 * @param {Object|Array} packages to use for instantiating the model
 * @param {Object} [options] additional options to pass over
 */
export default class CustomModdle extends Moddle {
  constructor(packages, options) {
    super(packages, options);
    this.ids = new Ids();
  }

  /**
   * The fromXML result.
   *
   * @typedef {Object} ParseResult
   *
   * @property {ModdleElement} rootElement
   * @property {Array<Object>} references
   * @property {Array<Error>} warnings
   * @property {Object} elementsById - a mapping containing each ID -> ModdleElement
   */
  /**
   * The fromXML error.
   *
   * @typedef {Error} ParseError
   *
   * @property {Array<Error>} warnings
   */
  /**
   * Instantiates a model tree from a given xml string.
   *
   * @param {String}   xmlStr
   * @param {String}   [typeName='MODELER_PREFIX:Definitions'] name of the root element
   * @param {Object}   [options]  options to pass to the underlying reader
   *
   * @returns {Promise<ParseResult, ParseError>}
   */
  fromXML(xmlStr, typeName, options) {
    if (!isString(typeName)) {
      options = typeName;
      typeName = `${MODELER_PREFIX}:Definitions`;
    }

    const reader = new Reader(assign({ model: this, lax: false }, options));
    const rootHandler = reader.handler(typeName);

    return reader.fromXML(xmlStr, rootHandler);
  }

  /**
   * The toXML result.
   *
   * @typedef {Object} SerializationResult
   *
   * @property {String} xml
   */
  /**
   * Serializes a Petri net object tree to XML.
   *
   * @param {String}   element    the root element, typically an instance of `${MODELER_PREFIX}:Definitions`
   * @param {Object}   [options]  to pass to the underlying writer
   *
   * @returns {Promise<SerializationResult, Error>}
   */
  toXML(element, options) {
    const writer = new Writer(options);

    return new Promise((resolve, reject) => {
      try {
        const result = writer.toXML(element);

        return resolve({
          xml: result,
        });
      } catch (err) {
        return reject(err);
      }
    });
  }
}
