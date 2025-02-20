export function hsvToRgb(h, s, v) {
  h = h % 360;
  s /= 100;
  v /= 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  const rgbMatrix = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];

  const rgb = rgbMatrix[Math.floor(h / 60)];
  return rgb.map((val) => Math.floor((val + m) * 255));
}

export function hsvToHsl(h, s, v) {
  s /= 100; 
  v /= 100; 
  const l = (2 - s) * v / 2;

  let sNew = 0;

  if (l !== 0 && l !== 1) {
    sNew = (v - l) / Math.min(l, 1 - l); 
  }

  return [h, Math.round(sNew * 100), Math.round(l * 100)];
}


export function hslToHsv(h, s, l) {
  s /= 100;
  l /= 100;

  const v = l + s * Math.min(l, 1 - l);

  const newS = v === 0 ? 0 : (s * (1 - Math.abs(2 * l - 1))) / v;

  return [h, Math.round(newS * 100), Math.round(v * 100)];
}


export function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const cmax = Math.max(r, g, b);
  const cmin = Math.min(r, g, b);
  const delta = cmax - cmin;

  let h = 0;
  if (delta) {
    if (cmax === r) h = 60 * (((g - b) / delta) % 6);
    else if (cmax === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  h = h < 0 ? h + 360 : h;

  const s = cmax ? (delta / cmax) * 100 : 0;
  const v = cmax * 100;
  return [Math.round(h), Math.round(s), Math.round(v)];
}

export function rgbToHex(r, g, b) {
  const toHex = (x) => x.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgb(hex) {
  hex = hex.replace("#", "");

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return [r, g, b];
}
