import { shapesBasepath } from './constants';

export enum AppNames {
  iDAIField,
  iDAIShapes,
}

export const getActiveApp = (): AppNames =>
  window.location.pathname.startsWith(shapesBasepath)
    ? AppNames.iDAIShapes
    : AppNames.iDAIField;
