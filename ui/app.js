createTintSelector();

const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgb(${r}, ${g}, ${b})`;
};

onmessage = (event) => {
  const message = JSON.parse(event.data.pluginMessage);
  console.log('connect-tints')
  switch (message.type) {
    case 'connect-tints':
      const pickers = document
        .getElementById('colors')
        .querySelectorAll('[itemprop=picker]').length;

      const colorPicker = document.getElementById(`color-input-${pickers}`);
      const colorName = document.getElementById(`colorName-${pickers}`);

      colorPicker.addEventListener(
        'change',
        fetchColor(colorPicker, colorName),
      );

      colorPicker.addEventListener('input', () => {
        colorName.disabled = true;
        const hex = colorPicker.value;
        colorPicker.on;

        for (let i = -6, j = 1; i < 3; i++, j = i + 7) {
          const picker = document.querySelector(
            `#color-container-${pickers} ul li div #tint-${j}00`,
          );
          const colorRgb = hexToRgb(hex);
          const tintHex = generateTint(colorRgb, i);
          picker.value = tintHex;

          const tint = document.querySelector(
            `#color-container-${pickers} ul li label.input-tint-label.tint-${j}00`,
          );
          tint.textContent = tintHex;
        }
      });

    default:
      break;
  }
};

document.getElementById('add-colors').onclick = () => createTintSelector();

document.getElementById('button-apply').onclick = () => {
  parent.postMessage(
    {
      pluginMessage: {
        type: 'create-circles',
        color: {
          rgb: colorRgb.textContent,
          hex: colorHex.textContent,
          colorTitle: colorName.value,
        },
      },
    },
    '*',
  );
};

const debounce = (func, wait, immediate) => {
  let timeout;

  return function () {
    const context = this,
      args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

const fetchColor = (colorPicker, colorNameElement) =>
  debounce(() => {
    const hex = colorPicker.value.replace('#', '');
    fetch(`https://www.thecolorapi.com/id?hex=${hex}&format=json`, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((response) => {
        colorNameElement.value = response.name.value;
        console.log(response.name.value);
        colorNameElement.disabled = false;
      });
  }, 500);

function createTintSelector() {
  let rgb = randomColor();
  const { r, g, b } = rgbToObject(rgb);
  let hex = rgbToHex(r, g, b);

  const colorsContainer = document.getElementById('colors');
  const colorNumber =
    colorsContainer.querySelectorAll('[itemprop=picker]').length + 1 || 1;

  const colorItem = document.createElement('div');
  colorItem.setAttribute('itemscope', '');
  colorItem.className = 'row';
  colorItem.id = `picker-container-${colorNumber}`;

  const colorForm = document.createElement('form');
  colorForm.setAttribute('itemprop', 'picker');
  colorForm.className = 'color-picker column align-center';
  colorForm.id = `color-picker-${colorNumber}`;

  const fieldset = document.createElement('fieldset');
  fieldset.className = 'input-color-container';

  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = hex;
  colorInput.className = 'input-color';
  colorInput.id = `color-input-${colorNumber}`;

  const colorLabel = document.createElement('label');
  colorLabel.textContent = hex;
  colorLabel.className = 'input-color-label';
  colorLabel.htmlFor = 'input-color';

  const tintList = document.createElement('ul');
  tintList.className = 'list row';

  //* Input color name
  const colorContainer = document.createElement('div');
  colorContainer.id = `color-container-${colorNumber}`;
  colorContainer.className = 'column';

  const colorNameInput = document.createElement('input');
  colorNameInput.id = `colorName-${colorNumber}`;
  colorNameInput.className = 'input__field input-field';
  colorNameInput.type = 'input';
  colorNameInput.placeholder = 'name';

  fetch(
    `https://www.thecolorapi.com/id?hex=${hex.replace('#', '')}&format=json`,
    { method: 'GET' },
  )
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      colorNameInput.value = response.name.value;
    });

  const colorNameInputContainer = document.createElement('div');
  colorNameInputContainer.className = 'input';

  const colorButton = document.createElement('button');
  colorButton.id = `remove-button-${colorNumber}`;
  colorButton.className = 'icon-button';
  colorButton.disabled = colorNumber < 1;

  const colorIcon = document.createElement('i');
  colorIcon.className = `icon icon--trash ${
    colorNumber === 1 ? 'icon--disabled' : ''
  }`;

  const colorNameContainer = document.createElement('div');
  colorNameContainer.id = 'color-name-container';
  colorNameContainer.className = 'row';

  colorForm.appendChild(fieldset);
  colorForm.appendChild(colorLabel);
  fieldset.appendChild(colorInput);

  colorItem.appendChild(colorForm);

  colorButton.appendChild(colorIcon);

  colorNameContainer.appendChild(colorNameInputContainer);
  colorNameInputContainer.appendChild(colorNameInput);
  colorNameContainer.appendChild(colorButton);

  //* Generate tints
  for (let i = -6, j = 1; i < 3; i++, j = i + 7) {
    const tintItem = document.createElement('li');
    const tintLabelContent = `${j}00`;
    tintItem.className = 'list-item';

    const tintHex = generateTint(rgb, i);
    const tintCircle = document.createElement('div');
    tintCircle.className = 'view-tint-container';

    const tint = document.createElement('input');
    tint.id = `tint-${tintLabelContent}`;
    tint.className = 'input-color';
    tint.type = 'color';
    tint.value = tintHex;
    tint.disabled = true;

    const tintLabel = document.createElement('label');
    tintLabel.className = 'input-tint-name-label';
    tintLabel.textContent = tintLabelContent;

    const hexLabel = document.createElement('label');
    hexLabel.className = `input-tint-label tint-${tintLabelContent}`;
    hexLabel.textContent = tintHex;

    tintCircle.appendChild(tint);
    tintItem.appendChild(tintCircle);
    tintItem.appendChild(tintLabel);
    tintItem.appendChild(hexLabel);

    tintList.appendChild(tintItem);
  }

  colorContainer.appendChild(colorNameContainer);
  colorContainer.appendChild(tintList);

  colorItem.appendChild(colorContainer);

  colorsContainer.appendChild(colorItem);

  if (colorNumber > 1) {
    document.getElementById(`remove-button-${colorNumber}`).onclick = () => {
      const colorContainer = document.getElementById(
        `picker-container-${colorNumber}`,
      );
      colorContainer.remove();
    };
  }

  //const event = new MessageEvent('message');
  //dispatchEvent(event);

  parent.postMessage(
    {
      pluginMessage: {
        type: 'add-circles-ui',
        color: {
          rgb: rgb,
          hex: hex,
          colorTitle: colorNameInput.value,
        },
      },
    },
    '*',
  );
}

function randomColor() {
  return `rgb(${getRandom(0, 220)},${getRandom(0, 220)},${getRandom(0, 220)})`;
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function calculateTints() {
  for (let i = -7, j = 1; i < 3; i++, j = i + 7) {
    document.getElementById(`color-${j}00`).value = generateTint(
      colorRgb.textContent,
      i,
    );
  }
}

function rgbToObject(rgb, noClamp = false) {
  const rgbArray = rgb.split('(')[1].split(',');
  const r = Math.round(rgbArray[0]);
  const g = Math.round(rgbArray[1]);
  const b = Math.round(rgbArray[2].slice(0, -1));

  if (noClamp) {
    return { r, g, b };
  }

  return { r: r / 255, g: g / 255, b: b / 255 };
}

function generateTint(rgb, level) {
  const { r, g, b } = rgbToObject(rgb);

  const step_lightness = 0.5 / 11;

  const { h, l, s } = rgbToHls(r, g, b);
  // * Create tints
  let lightness = l - level * step_lightness;
  lightness = Math.max(0, Math.min(1, lightness));

  const { r: _r, g: _g, b: _b } = hlsToRgb(h, lightness, s);

  // * Return the lightness tint
  return rgbToHex(_r, _g, _b);
}

function rgbToHls(r, g, b) {
  const maxc = Math.max(r, g, b);
  const minc = Math.min(r, g, b);
  const sumc = maxc + minc;
  const rangec = maxc - minc;
  const l = sumc / 2.0;
  let s;
  if (minc == maxc) {
    return { h: 0.0, l, s: 0.0 };
  }
  if (l <= 0.5) {
    s = rangec / sumc;
  } else {
    s = rangec / (2.0 - sumc);
  }
  const rc = (maxc - r) / rangec;
  const gc = (maxc - g) / rangec;
  const bc = (maxc - b) / rangec;

  let h;
  if (r == maxc) {
    h = bc - gc;
  } else if (g == maxc) {
    h = 2.0 + rc - bc;
  } else {
    h = 4.0 + gc - rc;
  }
  h = (h / 6.0) % 1.0;
  return { h, l, s };
}

function hlsToRgb(h, l, s) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r, g, b };
}

function rgbToHex(r, g, b) {
  return `#${(
    (1 << 24) +
    (Math.round(r * 255) << 16) +
    (Math.round(g * 255) << 8) +
    Math.round(b * 255)
  )
    .toString(16)
    .slice(1)}`;
}
