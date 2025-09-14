import { assign } from "min-dash";
import TextUtil from "diagram-js/lib/util/Text";

export const DEFAULT_TEXT_SIZE = 16;
export const LINE_HEIGHT_RATIO = 1.2;

export default class TextRenderer {
  constructor(config) {
    this._defaultStyle = assign(
      {
        fontFamily: "IBM Plex, sans-serif",
        fontSize: DEFAULT_TEXT_SIZE,
        fontWeight: "normal",
        lineHeight: LINE_HEIGHT_RATIO,
      },
      (config && config.defaultStyle) || {},
    );

    const fontSize = parseInt(this._defaultStyle.fontSize, 10);

    this._externalStyle = assign(
      {},
      this._defaultStyle,
      {
        fontSize: fontSize,
      },
      (config && config.externalStyle) || {},
    );

    this._textUtil = new TextUtil({
      style: this._defaultStyle,
    });
  }

  // Get the new bounds of an externally rendered, layouted label
  getExternalLabelBounds = function (bounds, text) {
    const layoutedDimensions = this._textUtil.getDimensions(text, {
      box: {
        width: 90,
        height: 30,
        x: bounds.width / 2 + bounds.x,
        y: bounds.height / 2 + bounds.y,
      },
      style: this._externalStyle,
    });

    // Resize label shape to fit label text
    return {
      x: Math.round(bounds.x + bounds.width / 2 - layoutedDimensions.width / 2),
      y: Math.round(bounds.y),
      width: Math.ceil(layoutedDimensions.width),
      height: Math.ceil(layoutedDimensions.height),
    };
  };

  // Create layouted text element as SVGElement
  createText = function (text, options) {
    return this._textUtil.createText(text, options || {});
  };

  getDefaultStyle = function () {
    return this._defaultStyle;
  };

  getExternalStyle = function () {
    return this._externalStyle;
  };
}

TextRenderer.$inject = ["config.textRenderer"];
