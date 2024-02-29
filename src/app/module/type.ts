// Types
export type Options = Array<{ value: any; label: string }>;
export type Option = { value: any; label: string };
export type Vis = {
  bands: Array<string>;
  min: Array<number>;
  max: Array<number>;
  palette?: Array<string>;
};
