import {
  changeHue,
  Easing,
  interpolateChannels,
  interpolateColor,
  RgbColor,
} from "./utils/color-utils";

// manual import/export to make the transpiled JS version of functions have a neat Utils variable
// instead of a webpack name imported module
const Utils = { Easing, changeHue, interpolateChannels, interpolateColor };

// a small hack to run code from editor within the scope of this file in order to use Utils and other variables
// defined in this file.
export const evaluate = (code: string) => eval(code);

const CHANNEL_COUNT = 30;

let gradientStart: RgbColor = [0, 50, 0];
let gradientStop: RgbColor = [0, 255, 0];

type Animation = {
  label: string;
  author: string;
  code: () => RgbColor[][];
};

const animations: Record<string, Animation> = {
  sleepy_rgb: {
    label: "Sleepy RGB",
    author: "saulis",
    code: () => {
      const base = [
        ...Utils.interpolateColor(
          gradientStart,
          gradientStop,
          CHANNEL_COUNT / 2
        ),
        ...Utils.interpolateColor(
          gradientStop,
          gradientStart,
          CHANNEL_COUNT / 2
        ),
      ];

      const keyframes = Array(CHANNEL_COUNT)
        .fill(0)
        .map((_, i) => [...base.slice(i), ...base.slice(0, i)]);

      const interpolated = keyframes.flatMap((_, i) =>
        i < keyframes.length - 1
          ? Utils.interpolateChannels(keyframes[i], keyframes[i + 1], 12)
          : Utils.interpolateChannels(keyframes[i], keyframes[0], 12)
      );

      return interpolated.map((frame, i) =>
        frame.map((color) => Utils.changeHue(color, i % 360))
      );
    },
  },
  knightRider2023: {
    label: "Knight Rider 2023",
    author: "saulis",
    code: () => {
      const base: RgbColor[] = new Array(CHANNEL_COUNT)
        .fill([0, 0, 0])
        .map((c, i) => (i === 0 ? [255, 0, 0] : c));

      const fade = Utils.interpolateColor([255, 0, 0], [0, 0, 0], 12);

      const frames = Array(CHANNEL_COUNT)
        .fill(0)
        .map((_, step) =>
          base.map((c, i) => fade[Math.abs(i - step)] || [0, 0, 0])
        );

      const interpolated = frames.flatMap((_, i) =>
        i < frames.length - 1
          ? Utils.interpolateChannels(frames[i], frames[i + 1], 2)
          : [frames[i]]
      );

      return [...interpolated, ...interpolated.reverse()];
    },
  },
  lighthouse: {
    label: "Lighthouse",
    author: "saulis",
    code: () => {
      const black = Array(CHANNEL_COUNT).fill([0, 0, 0]);
      const white = Array(CHANNEL_COUNT).fill([255, 255, 255]);

      const interpolated = Utils.interpolateChannels(
        black,
        white,
        100,
        Utils.Easing.EaseInSine
      );

      return [...interpolated, ...interpolated.reverse()];
    },
  },
  random1378: {
    label: "Random 1378",
    author: "saulis",
    code: () => {
      const randomColor = (): RgbColor => [
        Math.random() * 255,
        Math.random() * 255,
        Math.random() * 255,
      ];

      const randomizeFrame = () =>
        Array(CHANNEL_COUNT / 3) // number of windows
          .fill([0, 0, 0])
          .map((c) => (Math.random() > 0.9 ? randomColor() : c))
          .flatMap((v) => [v, v, v]); // spread same color on all 3 channels of each window

      const keyframes = Array(30)
        .fill(0)
        .map(() => randomizeFrame());

      const interpolated = keyframes
        // double each keyframe to make them stay lit up longer before changing to next keyframe
        .flatMap((k, i, values) => [values[i], values[i]])
        // interpolate values between keyframes
        .flatMap((k, i, values) =>
          i < values.length - 1
            ? Utils.interpolateChannels(values[i], values[i + 1], 30)
            : [values[i]]
        );

      // reverse the interpolated frames to make it loop smoothly from start to finish
      return [...interpolated, ...interpolated.reverse()];
    },
  },
};

export default animations;
