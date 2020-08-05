import {Channel, Message, MessageEmbed, Permissions, TextChannel} from 'discord.js';

import settings from '../bot.json';

interface CommandOptions {
  name?: string, description?: string, usage?: string, permissions?: number,
      whitelist?: Array<string>
}

interface EmbedOptions {
  channel: TextChannel, title: string, description?: string, image?: string,
      deletable?: boolean
}

/**
 * abstract represention of a curabot command
 * implemented by commands in /commands
 */
export default abstract class Command {
  private options: CommandOptions;

  /**
   * construct a new command instance
   * @param name name of the command
   * @param description description of how to use it
   * @param usage unused currently
   * @param commandLevel access level required to run the command
   * @param whitelist if not null, command can only be ran in channels in this
   *     list
   */
  constructor({
    name = '',
    description = 'No description provided',
    usage = 'No usage provided',
    permissions = Permissions.FLAGS.SEND_MESSAGES,
    whitelist = undefined
  }: CommandOptions = {}) {
    this.options = {name, description, usage, permissions, whitelist};
  }

  get name() {
    return this.options.name;
  }

  get description() {
    return this.options.description;
  }

  get usage() {
    return this.options.usage;
  }

  get permissions() {
    return this.options.permissions;
  }

  get whitelist() {
    return this.options.whitelist;
  }

  /**
   * run the command
   * @param msg message that initiated the command
   * @return Promise<boolean> whether the command was successful [UNUSED]
   */
  abstract run(msg: Message): Promise<boolean>;

  public shouldRunCommand(msg: Message): boolean {
    const whitelistedChannels = this.whitelist;

    // check if command was invoked from a text channel
    if (!(msg.channel instanceof TextChannel)) {
      return false;
    }

    // check that command is in whitelist (if whitelist exists)
    if (whitelistedChannels &&
        !whitelistedChannels.includes(msg.channel.name)) {
      this.sendFailMessage({
        channel: msg.channel,
        title: 'This command cannot be used in this channel',
        description: 'If you are stuck please message a staff member'
      });
      return false;
    }

    // check if the user has permission to run command
    if (!msg.member!.hasPermission(
            this.permissions!, {checkOwner: true, checkAdmin: true})) {
      this.sendFailMessage({
        channel: msg.channel,
        title: 'You do not have permission to use this command'
      });
      return false;
    }
    return true;
  }

  /**
   * sends an embed-style message to the server with the success colours
   * @param channel channel to send the message to
   * @param title title of the embed
   * @param description description of the embed
   * @param image image to attach to the embed
   * @param deletable whether the embed should be deleted after being sent
   */
  public async sendSuccessMessage(
      {channel, title, description = '', image, deletable = false}:
          EmbedOptions) {
    // construct a new RichEmbed object
    const embed = new MessageEmbed().setColor('#2ECC71').setTitle(title);

    // populate the embed
    if (description) {
      embed.setDescription(description);
    }
    if (image) {
      embed.setImage(image);
    }

    // send the embed
    const reply = await channel.send(embed) as Message;

    // if the message should be deleted, delete after delay
    const delay = settings.messageTimeout;
    if (deletable && delay > 0) {
      reply.delete({timeout: delay});
    }
  }

  /**
   * sends an embed-style message to the server with the fail colours
   * @param channel channel to send the message to
   * @param title title of the embed
   * @param description description of the embed
   * @param image image to attach to the embed
   * @param deletable whether the embed should be deleted after being sent
   */
  public async sendFailMessage(
      {channel, title, description = '', image, deletable = false}:
          EmbedOptions) {
    const embed = new MessageEmbed().setColor('#FF0000').setTitle(title);

    // populate the embed
    if (description) {
      embed.setDescription(description);
    }
    if (image) {
      embed.setImage(image);
    }

    // send the embed
    const reply = await channel.send(embed);

    // if the message should be deleted, delete after delay
    const delay = settings.messageTimeout;
    if (deletable && delay > 0) {
      reply.delete({timeout: delay});
    }
  }
}