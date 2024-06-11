function log(message) {
  console.log('LOG', message);
}

function postMessage(message) {
  return parent.postMessage(
    {
      pluginMessage: {
        ...message,
      },
    },
    '*',
  );
}

const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgb(${r}, ${g}, ${b})`;
};

onmessage = (event) => {
  const message = JSON.parse(event.data.pluginMessage);
  let color = message.data.color;
  let item = message.data.picker;

  switch (message.type) {
    case 'add-color':
      addColor(color);

      break;

    case 'pick-tints':
      const colorPicker = document.getElementById(`color-input-${item}`);
      const colorName = document.getElementById(`colorName-${item}`);

      colorPicker.addEventListener(
        'change',
        fetchColor(colorPicker, (name) => {
          colorName.value = name;
          colorName.disabled = false;

          postMessage({
            type: 'color-name',
            data: {
              picker: item,
              name: name,
            },
          });
        }),
      );

      colorName.disabled = true;

      color.tints.forEach((tintHex, j) => {
        const picker = document.querySelector(
          `#color-container-${item} ul li div #tint-${j + 1}00`,
        );
        picker.value = tintHex.value;

        const tint = document.querySelector(
          `#color-container-${item} ul li label.input-tint-label.tint-${
            j + 1
          }00`,
        );
        tint.textContent = tintHex.value;
      });
      break;

    default:
      break;
  }
};

document.getElementById('add-colors').onclick = () => {
  postMessage({
    type: 'add-color',
    //data{
    //  name:
    //}
  });
};

document.getElementById('button-apply').onclick = () => {
  postMessage({
    type: 'apply-styles',
  });
};

function addColor(color) {
  const hex = color.hex.value;
  const colorsContainer = document.getElementById('colors');
  const colorNumber =
    colorsContainer.querySelectorAll('[itemprop=picker]').length + 1 || 1;
  log('test: ' + colorNumber);

  const createElement = (tag, attributes = {}, ...children) => {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'className') {
        element.className = value;
      } else {
        element.setAttribute(key, value);
      }
    }
    children.forEach((child) => {
      if (!child) {
        throw new Error('No child element or value');
      }
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
        return;
      }
      element.appendChild(child);
    });
    return element;
  };

  const colorItem = createElement('div', {
    itemscope: '',
    className: 'row',
    id: `picker-container-${colorNumber}`,
  });
  const colorForm = createElement('form', {
    itemprop: 'picker',
    className: 'color-picker column align-center',
    id: `color-picker-${colorNumber}`,
  });

  const fieldset = createElement('fieldset', {
    className: 'input-color-container',
  });
  const colorInput = createElement('input', {
    type: 'color',
    value: hex,
    className: 'input-color',
    id: `color-input-${colorNumber}`,
  });
  const colorLabel = createElement(
    'label',
    {
      id: `input-label-${colorNumber}`,
      className: 'input-color-label',
      htmlFor: `color-input-${colorNumber}`,
    },
    hex,
  );

  fieldset.appendChild(colorInput);
  colorForm.append(fieldset, colorLabel);

  const colorContainer = createElement('div', {
    id: `color-container-${colorNumber}`,
    className: 'column',
  });
  const colorNameInput = createElement('input', {
    id: `colorName-${colorNumber}`,
    className: 'input__field input-field',
    type: 'input',
    placeholder: 'name',
  });

  fetch(
    `https://www.thecolorapi.com/id?hex=${hex.replace('#', '')}&format=json`,
  )
    .then((response) => response.json())
    .then((response) => {
      colorNameInput.value = response.name.value;

      postMessage({
        type: 'color-name',
        data: {
          picker: colorNumber,
          name: response.name.value,
        },
      });
    });

  const colorNameInputContainer = createElement(
    'div',
    { className: 'input' },
    colorNameInput,
  );
  const colorButton = createElement('button', {
    id: `remove-button-${colorNumber}`,
    className: 'icon-button',
    disabled: colorNumber < 1,
  });
  const colorIcon = createElement('i', {
    className: `icon icon--trash ${colorNumber === 1 ? 'icon--disabled' : ''}`,
  });

  colorButton.appendChild(colorIcon);
  const colorNameContainer = createElement(
    'div',
    { id: 'color-name-container', className: 'row' },
    colorNameInputContainer,
    colorButton,
  );

  const tintList = createElement('ul', { className: 'list row' });

  const hexTints = color.tints;

  hexTints.forEach((tintHex, j) => {
    const tintItem = createElement('li', { className: 'list-item' });
    const tintCircle = createElement('div', {
      className: 'view-tint-container',
    });

    const tint = createElement('input', {
      id: `tint-${j + 1}00`,
      className: 'input-color',
      type: 'color',
      value: tintHex.value,
      disabled: true,
    });
    const tintLabel = createElement(
      'label',
      { className: 'input-tint-name-label' },
      `${j + 1}00`,
    );
    const hexLabel = createElement(
      'label',
      { className: `input-tint-label tint-${j + 1}00` },
      tintHex.value,
    );

    tintCircle.appendChild(tint);
    tintItem.append(tintCircle, tintLabel, hexLabel);
    tintList.appendChild(tintItem);
  });

  colorContainer.append(colorNameContainer, tintList);
  colorItem.append(colorForm, colorContainer);
  colorsContainer.appendChild(colorItem);

  if (colorNumber > 1) {
    document.getElementById(`remove-button-${colorNumber}`).onclick = () => {
      document.getElementById(`picker-container-${colorNumber}`).remove();
    };
  }
  const colorPicker = document.getElementById(`color-input-${colorNumber}`);
  const colorName = document.getElementById(`colorName-${colorNumber}`);

  // * Send signal to connect tints from picker
  postMessage({
    type: 'pick-tints',
    data: {
      hex: colorPicker.value,
      picker: colorNumber,
      name: colorName.value,
    },
  });

  // * Add event listener to connect tints from picker
  colorPicker.addEventListener('input', () => {
    colorLabel.textContent = colorPicker.value;
    postMessage({
      type: 'pick-tints',
      data: {
        hex: colorPicker.value,
        picker: colorNumber,
        name: colorName.value,
      },
    });
  });
}

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

const fetchColor = (colorPicker, callback) =>
  debounce(() => {
    const hex = colorPicker.value.replace('#', '');
    fetch(`https://www.thecolorapi.com/id?hex=${hex}&format=json`, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((response) => {
        callback(response.name.value);
        //colorNameElement.value = response.name.value;
        //console.log(response.name.value);
        //colorNameElement.disabled = false;
      });
  }, 500);
