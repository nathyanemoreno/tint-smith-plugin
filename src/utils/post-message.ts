export function postMessage(message: Object) {
  figma.ui.postMessage(JSON.stringify(message), { origin: '*' });
}