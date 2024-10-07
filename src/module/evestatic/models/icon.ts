import jsonData from '$data/reference-data/icons.json';

export const iconData: { [icon_id: string]: Icon } = jsonData as any;

export enum IconSize {
  SIZE_32 = 32,
  SIZE_64 = 64,
  SIZE_128 = 128,
  SIZE_256 = 256,
  SIZE_512 = 512,
}

export class Icon {
  public readonly icon_id: number;
  public readonly description: string;
  public readonly file: string;

  constructor(icon_id: number) {
    const data = iconData[icon_id];
    if (!data) throw new Error(`Icon ID ${icon_id} not found in reference data`);
    this.icon_id = icon_id;
    this.description = data.description;
    this.file = data.file;
  }

  public getUrl({
    size = IconSize.SIZE_64,
    isBp = false,
    isBpc = false,
  }: {
    size?: IconSize;
    isBp?: boolean;
    isBpc?: boolean;
  } = {}): string {
    return `https://images.evetech.net/types/${this.icon_id}/icon${isBp ? '/bp' : isBpc ? '/bpc' : ''}?size=${size}`;
  }
}

export const getIcon = (icon_id: number): Icon => new Icon(icon_id);
