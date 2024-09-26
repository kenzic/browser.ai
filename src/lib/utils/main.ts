import { screen } from "electron";

interface WindowSize {
  width: number;
  height: number;
}

export function getWindowSize(): WindowSize {
  const primaryDisplay = screen.getPrimaryDisplay();
  const width = Math.round(primaryDisplay.workAreaSize.width * 0.80)
  const height = Math.round(primaryDisplay.workAreaSize.height * 0.90)
  return { width, height };
}
