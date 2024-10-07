import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

interface BaseBtnOpts {
  label: string;
  style?: ButtonStyle;
  emoji?: string;
  disabled?: boolean;
}

interface ButtonOptions extends BaseBtnOpts {
  customId: string;
}

interface LinkButtonOptions extends BaseBtnOpts {
  url: string;
}

export function createButton(options: ButtonOptions | LinkButtonOptions) {
  const button = new ButtonBuilder();
  if (options.label) button.setLabel(options.label);
  if (options.emoji) button.setEmoji(options.emoji);
  button.setStyle(options['url'] ? ButtonStyle.Link : options.style || ButtonStyle.Primary);
  if (options['customId']) button.setCustomId((options as ButtonOptions).customId);
  if (options['url']) button.setURL((options as LinkButtonOptions).url);
  if (options.disabled) button.setDisabled(options.disabled);
  return button;
}

export function createButtons(...options: (ButtonOptions | LinkButtonOptions)[]) {
  return options.filter(b => !!b).map(createButton);
}

export function createActionRow(...options: (ButtonOptions | LinkButtonOptions)[]) {
  const row = new ActionRowBuilder();
  row.addComponents(createButtons(...options));
  return row;
}
