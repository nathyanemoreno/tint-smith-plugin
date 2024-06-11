import { hslToRgb, rgbToHex, rgbToHls, rgbToObject, hexToRgb } from './convert';

export namespace ColorEntity {
  export interface ColorValidator {
    isAcceptable(value: string | number): boolean;
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
    hex?: HEX;
    hsl?: HSL;
    stepLightness?: number;
    defaultLevel?: number;
    amount?: number;
  };

  export class Color {
    hex: HEX;
    hsl: HSL;
    rgb?: RGB;
    stepLightness: number;
    defaultLevel: number;
    amount: number;
    tints: HEX[];

    constructor(base: string, obj?: IColor) {
      this.hex = new HEX(base ?? '#505050');
      this.hsl = obj?.hsl ?? HSL.fromHEX(this.hex.value ?? '#505050');
      //this.rgb = new RGB();
      this.stepLightness = obj?.stepLightness ?? 0.5 / 11;
      this.defaultLevel = obj?.defaultLevel ?? 7;
      this.amount = obj?.amount ?? 11;
      this.tints = [];
      this.generateTints();
    }

    generateTints(hex?: HEX) {
      const hsl = this.hsl;

      // * Set tints
      for (
        let level = -this.defaultLevel + 1, j = 1;
        level < this.amount - this.defaultLevel;
        level++, j = level + this.defaultLevel
      ) {
        let lightness = hsl.l - level * this.stepLightness;
        lightness = Math.max(0, Math.min(1, lightness));

        this.tints.push(
          HEX.fromHsl(new HSL({ h: hsl.h, s: hsl.s, l: lightness })),
        );
      }
    }
  }

  interface IRGB {
    r?: number;
    g?: number;
    b?: number;
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

    toString(): string {
      return `rgb(${this.r},${this.g},${this.b})`;
    }

    toObject(): { r: number; g: number; b: number } {
      return { r: this.r, g: this.g, b: this.b };
    }

    getTints() {
      return this.tints;
    }
  }
  interface IHSL {
    h?: number;
    s?: number;
    l?: number;
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

    isAcceptable(value: string): boolean {
      return objHSLRegexp.test(value);
    }

    toString(): string {
      return `hsl(${this.h},${this.s},${this.l})`;
    }

    toObject(): { h: number; s: number; l: number } {
      return { h: this.h, s: this.s, l: this.l };
    }

    static fromHEX(hex: string): HSL {
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

    isAcceptable(value: string): boolean {
      return objHEXRegexp.test(value);
    }

    static fromHsl(hsl: HSL): HEX {
      const { r: _r, g: _g, b: _b } = hslToRgb(hsl.h, hsl.s, hsl.l);

      // * Return the lightness tint
      return new HEX(rgbToHex(_r, _g, _b));
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

