import ShortUniqueId from 'short-unique-id';
import { ColorEntity, ColorMap } from './tint';
import { Message } from './types/message';
import { insertColors } from './ui';
import { postMessage } from './utils/post-message';

const uid = new ShortUniqueId({ length: 4 });

figma.showUI(__uiFiles__.main);

figma.ui.resize(820, 500);

// * Initialize list of colors
const colors: ColorMap = new Map();

// * Start with a color on the UI
const color = new ColorEntity.Color('#2DCCC2');
const id = uid.rnd();
color.name = 'Turquoise'
colors.set(id, color);

postMessage({ type: 'add-color', data: { id, color } });

figma.ui.onmessage = (msg: { type: string; data: Message }) => {
  // * First load font asynchronously
  (async () => {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

    switch (msg.type) {
      case 'add-color':
        const id = uid.rnd();

        const color = new ColorEntity.Color();

        postMessage({
          type: 'add-color',
          data: { id, color },
        });

        break;
      case 'color-name':
        const aColor = colors.get(msg.data.colorId);

        if (aColor) {
          aColor?.setName(msg.data?.name);

          colors.set(msg.data?.colorId, aColor);
        }

        break;

      case 'pick-tints':
        const newColor = new ColorEntity.Color(msg.data?.hex);
        newColor.setName(msg.data?.name);

        colors.set(msg.data?.colorId, newColor);

        postMessage({
          type: 'pick-tints',
          data: { id: msg.data.colorId, color: newColor },
        });

        break;
      case 'remove-color':
        colors.delete(msg.data?.colorId);
        break;
      case 'apply-styles':
        const { withContrast, withStyle } = msg.data;

        insertColors(colors, {
          withStyle,
          withContrast,
        });
        figma.closePlugin();
        break;
      default:
        figma.closePlugin();
    }
  })();
};
