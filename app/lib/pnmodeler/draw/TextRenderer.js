import { assign } from 'min-dash';
import TextUtil from 'diagram-js/lib/util/Text';

export const DEFAULT_TEXT_SIZE = 16;
export const LINE_HEIGHT_RATIO = 1.2;

export default function TextRenderer(config) {
  const defaultStyle = assign({
    fontFamily: 'IBM Plex, sans-serif',
    fontSize: DEFAULT_TEXT_SIZE,
    fontWeight: 'normal',
    lineHeight: LINE_HEIGHT_RATIO
  }, config && config.defaultStyle || {});

  const fontSize = parseInt(defaultStyle.fontSize, 10);

  const externalStyle = assign({}, defaultStyle, {
    fontSize: fontSize
  }, config && config.externalStyle || {});

  const textUtil = new TextUtil({
    style: defaultStyle
  });

  // Get the new bounds of an externally rendered, layouted label
  this.getExternalLabelBounds = function(bounds, text) {
    const layoutedDimensions = textUtil.getDimensions(text, {
      box: {
        width: 90,
        height: 30,
        x: bounds.width / 2 + bounds.x,
        y: bounds.height / 2 + bounds.y
      },
      style: externalStyle
    });

    // Resize label shape to fit label text
    return {
      x: Math.round(bounds.x + bounds.width / 2 - layoutedDimensions.width / 2),
      y: Math.round(bounds.y),
      width: Math.ceil(layoutedDimensions.width),
      height: Math.ceil(layoutedDimensions.height)
    };
  }

  // Create layouted text element as SVGElement
  this.createText = function(text, options) {
    return textUtil.createText(text, options || {});
  }

  this.getDefaultStyle = function () {
    return defaultStyle;
  }

  this.getExternalStyle = function () {
    return externalStyle;
  }
}

TextRenderer.$inject = [
  'config.textRenderer'
];
  