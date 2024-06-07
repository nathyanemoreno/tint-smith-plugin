// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

import { insertTints } from './ui';

// This shows the HTML page in "ui.html".

figma.showUI(__uiFiles__.main);

figma.ui.resize(1100, 500);

//figma.ui.postMessage(
//  JSON.stringify({ type: 'html', html: '<div> oi </div>' }),
//  { origin: '*' },
//);tMe

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg: { type: string; color: Record<string, string> }) => {
  //const { frameDirection } = msg.formDataObj;
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.

  // * First load font asynchronously
  (async () => {
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

    switch (msg.type) {
      case 'create-circles':
        insertTints(msg.color);
        figma.closePlugin();
        break;
      case 'add-circles-ui':
        console.log(msg.color);
        figma.ui.postMessage(JSON.stringify({ type: 'connect-tints' }));

        break;
      default:
        figma.closePlugin();
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
  })();
};
