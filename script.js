import {
  hsvToRgb,
  rgbToHsv,
  hsvToHsl,
  rgbToHex,
  hslToHsv,
  hexToRgb, 
} from "./colorUtils.js";

const palette = document.querySelector("#palette");
const palette__picker = document.querySelector("#palette__picker");
let palettePickerPos;
let palettePos;

const hmap = document.querySelector("#hmap");
const hmap__picker = document.querySelector("#hmap__picker");
const hmapCanvas = document.querySelector("#hmap__canvas");
const hctx = hmapCanvas.getContext("2d");
let hmapPickerPos;
let hmapPos;

const inputs = document.querySelectorAll("input");

const hexInput = document.querySelector("#hexInput");

const hInputHSV = document.querySelector("#hHSVInput");
const sInputHSV = document.querySelector("#sHSVInput");
const vInputHSV = document.querySelector("#vInput");

const hInputHSL = document.querySelector("#hHSLInput");
const sInputHSL = document.querySelector("#sHSLInput");
const lInputHSL = document.querySelector("#lInput");

const rInput = document.querySelector("#rInput");
const gInput = document.querySelector("#gInput");
const bInput = document.querySelector("#bInput");

let h = 0,
  s = 2,
  v = 98;
let lastScrollX = 0;
let lastScrollY = 0;

const groups = {
  hsv: ["hHSVInput", "sHSVInput", "vInput"],
  hsl: ["hHSLInput", "sHSLInput", "lInput"],
  rgb: ["rInput", "gInput", "bInput"],
};

function initCanvas(canvas) {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function generateHMap() {
  for (let x = 0; x < hmapCanvas.height; x++) {
    const hue = (x / (hmapCanvas.height - 1)) * 360;
    const [r, g, b] = hsvToRgb(hue, 100, 100);
    hctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    hctx.fillRect(0, x, hmapCanvas.width, 1);
  }
}

function inputValidate(item) {
  let value = item.value;
  if (item.id === "hexInput") {
    const hexPattern = /^[0-9A-Fa-f#]*$/;
    if (!hexPattern.test(value)) {
      item.value = value.slice(0, -1);
    }

    if (value && value[0] !== "#") {
      item.value = "#" + value;
    }
  }

  if (item.id !== "hexInput") {
    value = Number(item.value);
    for (const [listName, arr] of Object.entries(groups)) {
      if (!arr.includes(item.id)) continue;

      const isHue = arr.indexOf(item.id) === 0;

      switch (listName) {
        case "rgb":
          item.value = Math.max(0, Math.min(value, 255));
          break;
        case "hsl":
        case "hsv":
          item.value = Math.max(
            0,
            isHue ? Math.min(value, 360) : Math.min(value, 100)
          );
          break;
      }
    }

    if (isNaN(value)) {
      item.value = "";
    }
  }
}

// выбирает данные из соответствующих полей, переводит в h, s, v
// затем обновляет значения полей (кроме тех, которые непосредственно использовались)
// обновляет положение пикера

function MoveUpdateFromInputs(item) {
  let activeGroup = null;

  if (item.id === "hexInput") {
    [h, s, v] = rgbToHsv(...hexToRgb(item.value));
    activeGroup = "hex";
  } else {
    for (const [listName, arr] of Object.entries(groups)) {
      if (!arr.includes(item.id)) continue;

      const values = arr.map((id) => Number(document.getElementById(id).value));
      activeGroup = listName;

      switch (listName) {
        case "rgb":
          [h, s, v] = rgbToHsv(...values);
          break;
        case "hsl":
          [h, s, v] = hslToHsv(...values);
          break;
        case "hsv":
          [h, s, v] = values;
          break;
      }
    }
  }

  if (activeGroup) {
    inputsUpdate(activeGroup);
  }

  hmap__picker.style.top = (h / 360) * 500 + "px";
  palette__picker.style.left = s * 5 - 12 + "px";
  palette__picker.style.top = 500 - v * 5 - 12 + "px";
}

// обновление оттенка для класса .colorful
const colorUpdate = function () {
  let [r, g, b] = hsvToRgb(h, s, v);
  document.documentElement.style.setProperty(
    "--background-color",
    `rgba(${r}, ${g}, ${b}, 255)`
  );
};

// обновляет значения полей на основе глобальных переменных h, s, v
const inputsUpdate = function (activeGroup) {
  const rgb = hsvToRgb(h, s, v);
  const hex = rgbToHex(...rgb);
  const hsl = hsvToHsl(h, s, v);
  if (activeGroup !== "hex") hexInput.value = hex;

  if (activeGroup !== "hsv") {
    hInputHSV.value = h;
    sInputHSV.value = Math.round(s);
    vInputHSV.value = Math.round(v);
  }
  if (activeGroup !== "hsl") {
    hInputHSL.value = h;
    sInputHSL.value = hsl[1];
    lInputHSL.value = hsl[2];
  }
  if (activeGroup !== "rgb") {
    rInput.value = rgb[0];
    gInput.value = rgb[1];
    bInput.value = rgb[2];
  }

  colorUpdate();
  palette__canvas.style.background = `rgba(${hsvToRgb(h, 100, 100)[0]}, ${
    hsvToRgb(h, 100, 100)[1]
  }, ${hsvToRgb(h, 100, 100)[2]}, 255)`;
};

const pickerCalculation = function (event, pickerPos, areaPos, Xmoving) {
  const halfPickerY = Math.round(pickerPos.height / 2);
  let newY = event.pageY - halfPickerY;
  const minY = areaPos.top - halfPickerY + lastScrollY;
  const maxY = areaPos.bottom - halfPickerY + lastScrollY - 1;
  newY = Math.max(minY, Math.min(maxY, newY));
  const resultY = newY - areaPos.top - lastScrollY;
  if (Xmoving) {
    const halfPickerX = Math.round(pickerPos.width / 2);
    let newX = event.pageX - halfPickerX;
    const minX = areaPos.left - halfPickerX + lastScrollX;
    const maxX = areaPos.right - halfPickerX + lastScrollX - 1;
    newX = Math.max(minX, Math.min(maxX, newX));
    const resultX = newX - areaPos.left - lastScrollX;
    s = ((resultX + halfPickerX) / palettePos.width) * 100;
    v = 100 - ((resultY + halfPickerY) / palettePos.height) * 100;
    return [resultX, resultY];
  }

  return resultY;
};

const palettePickerMove = function (event) {
  let [resultX, resultY] = pickerCalculation(
    event,
    palettePickerPos,
    palettePos,
    true
  );

  palette__picker.style.left = resultX + "px";
  palette__picker.style.top = resultY + "px";

  colorUpdate();
  inputsUpdate();
};

const hmapPickerMove = function (event) {
  const resultY = pickerCalculation(event, hmapPickerPos, hmapPos, false);
  hmap__picker.style.top = resultY + "px";

  let [r, g, b] = hctx
    .getImageData(1, Number(hmap__picker.style.top.slice(0, -2)), 1, 1)
    .data.slice(0, -1);
  palette__canvas.style.background = `rgba(${r}, ${g}, ${b}, 255)`;

  h = rgbToHsv(r, g, b)[0];

  colorUpdate();
  inputsUpdate();
};

initCanvas(hmapCanvas);
generateHMap();
colorUpdate();
inputsUpdate();

document.addEventListener("mousedown", function (event) {
  lastScrollX = window.scrollX;
  lastScrollY = window.scrollY;

  if (event.target.id == "palette__canvas") {
    palettePickerPos = palette__picker.getBoundingClientRect();
    palettePos = palette.getBoundingClientRect();

    palettePickerMove(event);

    document.addEventListener("mousemove", palettePickerMove);
  }

  if (event.target.id == "hmap__canvas") {
    hmapPickerPos = hmap__picker.getBoundingClientRect();
    hmapPos = hmap.getBoundingClientRect();

    hmapPickerMove(event);

    document.addEventListener("mousemove", hmapPickerMove);
  }
});

document.addEventListener("mouseup", function () {
  document.removeEventListener("mousemove", palettePickerMove);
  document.removeEventListener("mousemove", hmapPickerMove);
});

inputs.forEach(function (item) {
  item.addEventListener("input", function () {
    inputValidate(item);
  });

  item.addEventListener("blur", function () {
    if (item.value === "") {
      inputsUpdate();
    }
    if (item.id === "hexInput") {
      if (item.value.length !== 7 && item.value.length !== 4) {
        inputsUpdate();
      }
    }
    MoveUpdateFromInputs(item);
  });

  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (item.id === "hexInput") {
        if (item.value.length !== 7 && item.value.length !== 4) {
          inputsUpdate();
        }
      }
      inputValidate(item);
      MoveUpdateFromInputs(item);
    }
  });

  item.addEventListener("wheel", (event) => {
    if (item.id === "hexInput") return;
  
    let value = (Number(item.value) || 0) + (event.deltaY < 0 ? 1 : -1);
    item.value = value;
    
    inputValidate(item);
    MoveUpdateFromInputs(item);
    event.preventDefault();
  });  
});
