import { ColorEntity } from './tint';
import { insertColors, insertTints } from './ui';

figma.showUI(__uiFiles__.main);

figma.ui.resize(820, 500);

const color = new ColorEntity.Color('#2DCCC2');

// * Start with a color on the UI
figma.ui.postMessage(
  JSON.stringify({
    type: 'add-color',
    data: { color },
  }),
  { origin: '*' },
);

const colors = new Map<number, ColorEntity.Color>();
colors.set(1, color);

type Message = {
  hex: string;
  picker: number;
  name: string;
  withContrast?: boolean;
  withStyle?: boolean;
};

figma.ui.onmessage = (msg: { type: string; data: Message }) => {
  //const { frameDirection } = msg.formDataObj;

  // * First load font asynchronously
  (async () => {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

    switch (msg.type) {
      case 'add-color':
        const color = new ColorEntity.Color('#2DCCC2');

        figma.ui.postMessage(
          JSON.stringify({
            type: 'add-color',
            data: { color },
          }),
          { origin: '*' },
        );

        break;
      case 'color-name':
        console.log(msg.data?.name);
        const aColor = colors.get(msg.data.picker);

        if (aColor) {
          aColor?.setName(msg.data?.name);

          colors.set(msg.data?.picker, aColor);
        }

        break;

      case 'pick-tints':
        const newColor = new ColorEntity.Color(msg.data?.hex);
        newColor.setName(msg.data?.name);

        colors.set(msg.data?.picker, newColor);

        figma.ui.postMessage(
          JSON.stringify({
            type: 'pick-tints',
            data: { color: newColor, picker: msg.data.picker },
          }),
          { origin: '*' },
        );
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
