import jsonData from '../../../data/reference-data/icons.json';

export const iconData: { [icon_id: string]: Icon } = jsonData as any;

export enum IconSize {
  SIZE_32 = 32,
  SIZE_64 = 64,
  SIZE_128 = 128,
  SIZE_256 = 256,
  SIZE_512 = 512,
}

export interface Icon {
  readonly icon_id: number;
  readonly description: string;
  readonly file: string;
}

export function getIcon(icon_id: number) {
  const data = iconData[icon_id];
  if (!data) throw new Error(`Icon ID ${icon_id} not found in reference data`);
  return data;
}


export function getIconUrl(icon_id: Icon, {
  size = IconSize.SIZE_64,
  isBp = false,
  isBpc = false,
}: {
  size?: IconSize;
  isBp?: boolean;
  isBpc?: boolean;
} = {}): string {
  return `https://images.evetech.net/types/${icon_id}/icon${isBp ? '/bp' : isBpc ? '/bpc' : ''}?size=${size}`;
}

