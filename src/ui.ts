import { getContrastRatios } from './contrast';
import { ColorEntity } from './tint';

type IInsertColorsParams = {
  withStyle?: boolean;
  withContrast?: boolean;
};

type IInsertTintParams = {
  color: ColorEntity.Color;
  withStyle?: boolean;
  withContrast?: boolean;
};

export function insertColors(
  colors: Map<number, ColorEntity.Color>,
  options: IInsertColorsParams,
) {
  const mainFrame = figma.createFrame();
  mainFrame.layoutMode = 'HORIZONTAL';
  mainFrame.layoutSizingVertical = 'HUG';
  mainFrame.layoutSizingHorizontal = 'HUG';
  mainFrame.verticalPadding = 30;
  mainFrame.horizontalPadding = 30;

  figma.currentPage.appendChild(mainFrame);

  colors.forEach((color: ColorEntity.Color) => {
    const colorFrame = insertTints({ color, ...options });

    mainFrame.appendChild(colorFrame);
  });

  const selectFrame: FrameNode[] = [];

  selectFrame.push(mainFrame);

  figma.currentPage.selection = selectFrame;
  figma.viewport.scrollAndZoomIntoView(selectFrame);
}

export function insertTints({
  color,
  withStyle = false,
  withContrast = true,
}: IInsertTintParams) {
  const colorName = color.name || 'Unnamed';
  const colorFrame = figma.createFrame();

  const frameTitle = figma.createText();
  frameTitle.fontSize = 24;
  frameTitle.characters = colorName;

  colorFrame.x = 0;
  colorFrame.itemSpacing = 15;
  colorFrame.layoutMode = 'VERTICAL';
  colorFrame.layoutSizingVertical = 'HUG';
  colorFrame.layoutSizingHorizontal = 'HUG';
  colorFrame.verticalPadding = 30;
  colorFrame.horizontalPadding = 30;

  colorFrame.appendChild(frameTitle);

  // * Get tints
  color.tints.forEach((tintHex, j) => {
    const rgb = new ColorEntity.RGB().fromHEX(tintHex.value!);
    const { r, g, b } = rgb.clamped();

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

    // * Apply the lightness tint
    tintFrame.fills = [{ type: 'SOLID', color: { r, g, b } }];

    if (withContrast) {
      // * Add contrast
      const { black, white } = getContrastRatios(r, g, b);
      const { blackContrastFrame, whiteContrastFrame } = createContrastFrame(
        black,
        white,
      );

      tintFrame.appendChild(blackContrastFrame);
      tintFrame.appendChild(whiteContrastFrame);
    }

    // * Create tint information frame
    const tintInfoFrame = createTintInfoFrame(
      `${colorName.toLowerCase()} - ${(j + 1) * 100}`,
      tintHex.value!,
      rgb.toString(),
    );

    mainTintFrame.appendChild(tintFrame);

    tintFrame.layoutSizingVertical = 'FILL';

    mainTintFrame.appendChild(tintInfoFrame);
    colorFrame.appendChild(mainTintFrame);

    mainTintFrame.layoutSizingHorizontal = 'FILL';

    if (withStyle) {
      try {
        const style = figma.createPaintStyle();
        style.name = `${colorName}/${colorName.toLowerCase()}-${j * 100}`;
        style.paints = [
          {
            type: 'SOLID',
            color: { r: r, g: g, b: b },
            opacity: 1,
          },
        ];
      } catch (error) {
        console.error(
          `Error creating style for ${colorName}-${j * 100}:`,
          error,
        );
      }
    }
  });

  return colorFrame;
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

  const textHexValue = textColorBase.clone();
  textHexValue.characters = rgb;

  const textRgbValue = textColorBase.clone();
  textRgbValue.characters = hex;

  textColorBase.remove();

  baseFrame.appendChild(textTintLevel);
  baseFrame.appendChild(textHexValue);
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
