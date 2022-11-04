import {
  type LinkButtonComponentData,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export class LinkButtonBuilder extends ButtonBuilder {
  constructor(arg: Partial<Omit<LinkButtonComponentData, "link">> = {}) {
    super(Object.assign(arg, { style: ButtonStyle.Link }));
  }
}
