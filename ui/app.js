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

onmessage = (event) => {
  const message = JSON.parse(event.data.pluginMessage);
  let id = message.data.id;
  let color = message.data.color;

  switch (message.type) {
    case 'add-color':
      addColor(id, color);
      document
        .getElementById('colors-list')
        .scrollTo(0, document.body.scrollHeight);

      resetRemoveButtons();
      break;

    case 'pick-tints':
      const colorPicker = document.getElementById(`color-input-${id}`);
      const colorName = document.getElementById(`colorName-${id}`);

      colorName.disabled = true;

      colorPicker.addEventListener(
        'change',
        fetchColor(colorPicker, (name) => {
          colorName.value = name;

          postMessage({
            type: 'color-name',
            data: {
              colorId: id,
              name: name,
            },
          });
        }),
      );

      colorName.disabled = false;

      color.tints.forEach((tintHex, j) => {
        const picker = document.querySelector(
          `#color-container-${id} ul li div #tint-${j + 1}00`,
        );
        picker.value = tintHex.value;

        const tint = document.querySelector(
          `#color-container-${id} ul li label.input-tint-label.tint-${j + 1}00`,
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
  });
};

document.getElementById('button-apply').onclick = () => {
  const withContrast = document.getElementById('with_contrast').checked;
  const withStyle = document.getElementById('with_style').checked;

  postMessage({
    type: 'apply-styles',
    data: {
      withContrast,
      withStyle,
    },
  });
};

function resetRemoveButtons() {
  const colorsContainer = document.getElementById('colors');
  const disabled =
    colorsContainer.querySelectorAll('[itemprop=picker]').length <= 1;

  const colorButton = document.querySelector(`.icon-button`);

  colorButton.disabled = disabled;

  const colorIcon = document.querySelector(`.icon-button i`);
  colorIcon.className = `icon icon--trash ${disabled ? 'icon--disabled' : ''}`;
}

function addColor(colorId, color) {
  const hex = color.hex.value;
  const colorsContainer = document.getElementById('colors');

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
    id: `picker-container-${colorId}`,
  });
  const colorForm = createElement('form', {
    itemprop: 'picker',
    className: 'color-picker column align-center',
    id: `color-picker-${colorId}`,
  });

  const fieldset = createElement('fieldset', {
    className: 'input-color-container',
  });
  const colorInput = createElement('input', {
    type: 'color',
    value: hex,
    className: 'input-color',
    id: `color-input-${colorId}`,
  });
  const colorLabel = createElement(
    'label',
    {
      id: `input-label-${colorId}`,
      className: 'input-color-label',
      htmlFor: `color-input-${colorId}`,
    },
    hex,
  );

  fieldset.appendChild(colorInput);
  colorForm.append(fieldset, colorLabel);

  const colorContainer = createElement('div', {
    id: `color-container-${colorId}`,
    className: 'column',
  });
  const colorNameInput = createElement('input', {
    id: `colorName-${colorId}`,
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
          colorId: colorId,
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
    id: `remove-button-${colorId}`,
    className: 'icon-button',
  });

  colorButton.disabled = colorId <= 1;

  const colorIcon = createElement('i', {
    className: `icon icon--trash ${colorId === 1 ? 'icon--disabled' : ''}`,
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

  const colorPicker = document.getElementById(`color-input-${colorId}`);
  const colorName = document.getElementById(`colorName-${colorId}`);

  // * Send signal to connect tints from picker
  postMessage({
    type: 'pick-tints',
    data: {
      colorId: colorId,
      hex: colorPicker.value,
      name: colorName.value,
    },
  });

  // * Add event listener to connect tints from picker
  colorPicker.addEventListener('input', () => {
    colorLabel.textContent = colorPicker.value;
    postMessage({
      type: 'pick-tints',
      data: {
        colorId: colorId,
        hex: colorPicker.value,
        name: colorName.value,
      },
    });
  });

  document.getElementById(`remove-button-${colorId}`).onclick = () => {
    document.getElementById(`picker-container-${colorId}`).remove();

    postMessage({
      type: 'remove-color',
      data: {
        colorId: colorId,
      },
    });

    resetRemoveButtons();
  };
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
      });
  }, 500);
