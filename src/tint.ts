import { hexToRgb, hslToRgb, rgbToHex, rgbToHls, rgbToObject } from './convert';

export type ColorMap<K = string, V = ColorEntity.Color> = Map<K, V>;

export namespace ColorEntity {
  export interface ColorValidator {
    isAcceptable(value: string): boolean;
    toString(value: string): string;
  }

  const objHEXRegexp = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
  const objRGBRegexp = /rgb\((([0-9],|[0-9][0-9],|[1-2][0-4][0-9]|(250))){3}\)/;
  // TODO: remove match ',' on the end of the string
  const objHSLRegexp =
    /hsl\((([0-9]|[0-9][0-9]|[0-3][0-5][0-9]|(360))),(([0-9]|[0-9][0-9]|(100)),*){2}\)/;

  function getRandom(min: number, max: number) {
    return parseInt((Math.random() * (max - min) + min).toFixed(0));
  }

  type IColor = {
    name: string;
    rgb?: RGB;
    hex?: HEX;
    hsl?: HSL;
    stepLightness?: number;
    defaultLevel?: number;
    amount?: number;
  };

  export class Color {
    private stepLightness: number;
    private defaultLevel: number;
    private amount: number;

    base: string;
    name?: string;
    hex: HEX;
    hsl: HSL;
    rgb: RGB;

    tints: HEX[];

    constructor(base: string, obj?: IColor) {
      this.base = base;
      this.name = obj?.name;
      this.hex = new HEX();
      this.hsl = new HSL();
      //this.hsl = obj?.hsl ?? HSL.fromHEX(this.hex.value ?? '#505050');
      this.rgb = new RGB();

      this.stepLightness = obj?.stepLightness ?? 0.5 / 11;
      this.defaultLevel = obj?.defaultLevel ?? 7;
      this.amount = obj?.amount ?? 11;
      this.tints = [];
      this.init();
      this.generateTints();
    }

    private init() {
      if (this.hex.isAcceptable(this.base)) {
        this.hex.set(this.base);
        this.rgb = this.rgb.fromHEX(this.base);
        this.hsl = this.hsl.fromHEX(this.base);
      }

      if (this.rgb.isAcceptable(this.base)) {
        this.rgb.set(this.base);
        this.hex = this.hex.fromRgb(this.base);
        this.hsl = this.hsl.fromHEX(this.base);
      }

      if (this.hsl.isAcceptable(this.base)) {
        this.hsl.set(this.base);
        this.hex = this.hex.fromHsl(this.base);
        this.rgb = this.rgb.fromHsl(this.base);
      }
    }

    setName(name: string) {
      this.name = name;
    }

    private generateTints(hex?: HEX) {
      const hsl = this.hsl;

      //debugger;
      // * Set tints
      for (
        let level = -this.defaultLevel + 1, j = 1;
        level < this.amount - this.defaultLevel;
        level++, j = level + this.defaultLevel
      ) {
        let lightness = hsl.l - level * this.stepLightness;
        lightness = Math.max(0, Math.min(1, lightness));

        this.tints.push(
          new HEX().fromHsl({ h: hsl.h, s: hsl.s, l: lightness }),
        );
      }
    }
  }

  interface IRGB {
    r: number;
    g: number;
    b: number;
    min?: number;
    max?: number;
  }

  export class RGB implements ColorValidator {
    r: number;
    g: number;
    b: number;
    private tints: RGB[] = [];

    constructor(obj?: IRGB) {
      this.r = obj?.r ?? getRandom(obj?.min ?? 0, obj?.max ?? 255);
      this.g = obj?.g ?? getRandom(obj?.min ?? 0, obj?.max ?? 255);
      this.b = obj?.b ?? getRandom(obj?.min ?? 0, obj?.max ?? 255);
    }

    isAcceptable(value: string): boolean {
      return objRGBRegexp.test(value);
    }

    set(value: string | IRGB) {
      if (typeof value === 'string') {
        value = this.fromString(value);
      }

      this.r = value.r;
      this.g = value.g;
      this.b = value.b;
    }

    toString(): string {
      return `rgb(${this.r},${this.g},${this.b})`;
    }

    toObject(): { r: number; g: number; b: number } {
      return { r: this.r, g: this.g, b: this.b };
    }
    private clamp(v: number) {
      return Math.round(v);
    }

    clamped() {
      return {
        r: this.r / 255,
        g: this.g / 255,
        b: this.b / 255,
      };
    }

    fromString(value: string) {
      const arr = value
        .slice(4, -1)
        .split(',')
        .map((r) => Number(r));
      const r = this.clamp(arr[0]);
      const g = this.clamp(arr[1]);
      const b = this.clamp(arr[2]);

      //if (noClamp) {
      //  return { r, g, b };
      //}

      return new RGB({ r, g, b });
    }

    fromHsl(value: string | IHSL): RGB {
      if (typeof value === 'string') {
        const hsl = new HSL();
        value = hsl.fromString(value);
      }

      const { h, s, l } = value;

      let r: number, g: number, b: number;

      if (s === 0) {
        r = g = b = l; // achromatic
      } else {
        const hue2rgb = (p: number, q: number, t: number): number => {
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

      return new RGB({ r, g, b });
    }

    fromHEX(value: string): RGB {
      const bigint = parseInt(value.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return new RGB({ r, g, b });
    }
  }
  interface IHSL {
    h: number;
    s: number;
    l: number;
    satBound?: number[];
    lumBound?: number[];
  }
  export class HSL implements ColorValidator {
    h: number;
    s: number;
    l: number;
    //private tints: HSL[] = [];

    constructor(obj?: IHSL) {
      this.h = obj?.h ?? getRandom(0, 360);
      this.s =
        obj?.s ?? getRandom(obj?.satBound?.[0] ?? 50, obj?.satBound?.[1] ?? 50);
      this.l =
        obj?.l ?? getRandom(obj?.lumBound?.[0] ?? 50, obj?.lumBound?.[1] ?? 50);
    }

    set(value: string | IHSL) {
      if (typeof value === 'string') {
        value = this.fromString(value);
      }

      this.h = value.h;
      this.s = value.s;
      this.l = value.l;
    }

    isAcceptable(value: string): boolean {
      return objHSLRegexp.test(value);
    }

    toString(): string {
      return `hsl(${this.h},${this.s},${this.l})`;
    }

    toObject(): { h: number; s: number; l: number } {
      return { h: this.h, s: this.s, l: this.l };
    }

    fromString(value: string): HSL {
      const arr = value
        .slice(4, -1)
        .split(',')
        .map((r) => Number(r));
      const h = Math.round(arr[0]);
      const s = Math.round(arr[1]);
      const l = Math.round(arr[2]);

      return new HSL({ h, s, l });
    }

    fromHEX(hex: string): HSL {
      const { r, g, b } = rgbToObject(hexToRgb(hex));
      const { h, s, l } = rgbToHls(r, g, b);

      return new HSL({ h, s, l });
    }
  }

  export class HEX implements ColorValidator {
    value?: string;

    constructor(value?: string) {
      this.value = value;
    }

    set(value: string) {
      this.value = value;
    }

    isAcceptable(value: string): boolean {
      return objHEXRegexp.test(value);
    }

    fromRgb(value: string | IRGB): HEX {
      if (typeof value === 'string') {
        const rgb = new RGB();
        value = rgb.fromString(value);
      }

      return new HEX(
        `#${(
          (1 << 24) +
          (Math.round(value.r * 255) << 16) +
          (Math.round(value.g * 255) << 8) +
          Math.round(value.b * 255)
        )
          .toString(16)
          .slice(1)}`,
      );
    }

    fromHsl(value: string | IHSL): HEX {
      if (typeof value === 'string') {
        const hsl = new HSL();
        value = hsl.fromString(value);
      }
      const { r, g, b } = hslToRgb(value.h, value.s, value.l);

      return new HEX(rgbToHex(r, g, b));
    }
  }
}

export function generateTint(
  rgb: string,
  level: number,
): { r: number; g: number; b: number } {
  const rgbArray = rgb.split('(')[1].split(',');
  const r = Number(rgbArray[0]) / 255;
  const g = Number(rgbArray[1]) / 255;
  const b = Number(rgbArray[2].slice(0, -1)) / 255;

  const step_lightness = 0.5 / 11;

  const { h, l, s } = rgbToHls(r, g, b);
  // * Create tints
  let lightness = l - level * step_lightness;
  lightness = Math.max(0, Math.min(1, lightness));

  // * Return the lightness tint
  return hslToRgb(h, lightness, s);
}

//const fetchColor = (colorPicker, callback) =>
//  debounce(() => {
//    const hex = colorPicker.value.replace('#', '');
//    fetch(`https://www.thecolorapi.com/id?hex=${hex}&format=json`, {
//      method: 'GET',
//    })
//      .then((response) => response.json())
//      .then((response) => {
//        callback(response.name.value);
//      });
//  }, 500);
