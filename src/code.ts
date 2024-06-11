import { ColorEntity } from './tint';
import { insertTints } from './ui';

// This shows the HTML page in "ui.html".

figma.showUI(__uiFiles__.main);

figma.ui.resize(1100, 500);

const color = new ColorEntity.Color('#202020');

// * Start with a color on the UI
figma.ui.postMessage(
  JSON.stringify({
    type: 'add-color',
    data: { color },
  }),
  { origin: '*' },
);

figma.ui.onmessage = (msg: { type: string; data: Record<string, string> }) => {
  //const { frameDirection } = msg.formDataObj;

  // * First load font asynchronously
  (async () => {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

    switch (msg.type) {
      case 'create-circles':
        insertTints(msg.data);
        figma.closePlugin();
        break;
      case 'add-color':
        const color = new ColorEntity.Color('#1e1e1e');
        figma.ui.postMessage(
          JSON.stringify({
            type: 'add-color',
            data: { color },
          }),
          { origin: '*' },
        );

        break;
      case 'pick-tints':
        const newColor = new ColorEntity.Color(msg.data?.hex);
        figma.ui.postMessage(
          JSON.stringify({
            type: 'pick-tints',
            data: { color: newColor, picker: msg.data.picker },
          }),
          { origin: '*' },
        );
        break;

      default:
        figma.closePlugin();
    }
  })();
};
