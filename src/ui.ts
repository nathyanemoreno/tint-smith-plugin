import { getContrastRatios } from './contrast';
import { rgbToHex, rgbFormat } from './convert';
import { generateTint } from './tint';

export function insertTints({
  rgb,
  colorTitle,
  shouldCreateStyle,
}: Record<string, string>) {
  const mainFrame = figma.createFrame();

  const frameTitle = figma.createText();
  frameTitle.fontSize = 24;
  frameTitle.characters = colorTitle;

  mainFrame.x = 0;
  mainFrame.itemSpacing = 15;
  mainFrame.layoutMode = 'VERTICAL';
  mainFrame.layoutSizingVertical = 'HUG';
  mainFrame.layoutSizingHorizontal = 'HUG';
  mainFrame.verticalPadding = 30;
  mainFrame.horizontalPadding = 30;

  mainFrame.appendChild(frameTitle);

  for (let i = -7, j = 0; i < 3; i++, j = i + 7) {
    const mainTintFrame = figma.createFrame();
    mainTintFrame.layoutMode = 'HORIZONTAL';
    mainTintFrame.itemSpacing = 5;
    mainTintFrame.layoutSizingVertical = 'HUG';

    const tintFrame = figma.createFrame();
    tintFrame.layoutMode = 'VERTICAL';
    tintFrame.itemSpacing = 5;
    tintFrame.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.95 } }];
    tintFrame.verticalPadding = 5;
    tintFrame.horizontalPadding = 5;
    tintFrame.cornerRadius = 10;

    // * Create tints
    const { r: _r, g: _g, b: _b } = generateTint(rgb, i);

    // * Apply the lightness tint
    tintFrame.fills = [{ type: 'SOLID', color: { r: _r, g: _g, b: _b } }];

    // * Add contrast
    const { black, white } = getContrastRatios(_r, _g, _b);
    const { blackContrastFrame, whiteContrastFrame } = createContrastFrame(
      black,
      white,
    );

    // * Create tint information frame
    const tintInfoFrame = createTintInfoFrame(
      `${colorTitle.toLowerCase()} - ${j * 100}`,
      rgbToHex(_r, _g, _b),
      rgbFormat(_r, _g, _b),
    );

    tintFrame.appendChild(blackContrastFrame);
    tintFrame.appendChild(whiteContrastFrame);
    mainTintFrame.appendChild(tintFrame);

    tintFrame.layoutSizingVertical = 'FILL';

    mainTintFrame.appendChild(tintInfoFrame);
    mainFrame.appendChild(mainTintFrame);

    mainTintFrame.layoutSizingHorizontal = 'FILL';

    if (shouldCreateStyle) {
      try {
        const style = figma.createPaintStyle();
        style.name = `${colorTitle}/${colorTitle.toLowerCase()}-${j * 100}`;
        style.paints = [
          {
            type: 'SOLID',
            color: { r: _r, g: _g, b: _b },
            opacity: 1,
          },
        ];
      } catch (error) {
        console.error(
          `Error creating style for ${colorTitle} - ${j * 100}:`,
          error,
        );
      }
    }

    figma.currentPage.appendChild(mainFrame);
  }

  const selectFrame: FrameNode[] = [];

  selectFrame.push(mainFrame);

  figma.currentPage.selection = selectFrame;
  figma.viewport.scrollAndZoomIntoView(selectFrame);
}

export function createTintInfoFrame(
  tintLevel: string,
  hex: string,
  rgb: string,
): FrameNode {
  const baseFrame = figma.createFrame();

  baseFrame.layoutMode = 'VERTICAL';
  baseFrame.layoutSizingVertical = 'HUG';
  baseFrame.layoutSizingHorizontal = 'HUG';
  baseFrame.primaryAxisAlignItems = 'CENTER';
  baseFrame.horizontalPadding = 4;
  baseFrame.itemSpacing = 2;

  const textTintLevel = figma.createText();
  textTintLevel.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  textTintLevel.characters = tintLevel;
  textTintLevel.fontSize = 14;

  const textColorBase = figma.createText();
  textColorBase.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.56 } }];
  textColorBase.fontSize = 10;

  const textHextValue = textColorBase.clone();
  textHextValue.characters = rgb;

  const textRgbValue = textColorBase.clone();
  textRgbValue.characters = hex;

  textColorBase.remove();

  baseFrame.appendChild(textTintLevel);
  baseFrame.appendChild(textHextValue);
  baseFrame.appendChild(textRgbValue);

  return baseFrame;
}

export function createContrastFrame(
  black: number,
  white: number,
): Record<string, FrameNode> {
  const contrastFrame = figma.createFrame();

  contrastFrame.layoutMode = 'HORIZONTAL';
  contrastFrame.layoutSizingVertical = 'HUG';
  contrastFrame.layoutSizingHorizontal = 'HUG';
  contrastFrame.primaryAxisAlignItems = 'CENTER';
  contrastFrame.counterAxisAlignItems = 'CENTER';
  contrastFrame.verticalPadding = 2;
  contrastFrame.horizontalPadding = 4;
  contrastFrame.itemSpacing = 5;
  contrastFrame.cornerRadius = 20;
  contrastFrame.opacity = 0.8;

  const textRatio = figma.createText();
  textRatio.fontSize = 8;

  const whiteRatio = textRatio.clone();
  const blackRatio = textRatio.clone();

  whiteRatio.characters = white.toFixed(2);
  blackRatio.characters = black.toFixed(2);

  const blackContrastFrame = contrastFrame.clone();
  const whiteContrastFrame = contrastFrame.clone();

  const ellipsis = figma.createEllipse();
  ellipsis.resize(10, 10);
  ellipsis.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.95 } }];

  const blackEllipsis = ellipsis.clone();
  blackEllipsis.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];

  const whiteEllipsis = ellipsis.clone();
  whiteEllipsis.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

  ellipsis.remove();
  contrastFrame.remove();
  textRatio.remove();

  blackContrastFrame.appendChild(blackEllipsis);
  blackContrastFrame.appendChild(blackRatio);
  whiteContrastFrame.appendChild(whiteEllipsis);
  whiteContrastFrame.appendChild(whiteRatio);

  return { blackContrastFrame, whiteContrastFrame };
}
