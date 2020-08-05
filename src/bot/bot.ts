import {Client, Message} from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

import settings from '../bot.json';

import Command from './command.js';

export interface CommandProcessor extends Command {
  internalRun(msg: Message, commands: Array<Command>): void;
}

class JohnsonBot {
  private client: Client;
  private token: string;
  private commands: Array<Command>;

  constructor(token: string) {
    this.token = token;
    this.client = new Client();
    this.commands = new Array<Command>();

    this.loadCommands();
    this.client.on('message', this.onMessage.bind(this));
  }

  async login() {
    return this.client.login(this.token);
  }

  async onMessage(message: Message) {
    if (message.content.startsWith(settings.prefix)) {
      // get the command impl for command type
      const command = this.commandForMessage(message);
      if (command) {
        // if the command should be run
        if (command.shouldRunCommand(message)) {
          try {
            // check if the command should use the alternate handler (e.g. help
            // command)
            if (this.canUseInternal(command)) {
              (command as CommandProcessor).internalRun(message, this.commands);
            } else {
              command.run(message);
            }
          } catch (e) {
            console.log(
                `An error occurred running command ${command.name}: [${e}]`);
          }
        }
      }
    }
  }

  private loadCommands() {
    // read each file and require() it.
    const commandDir: string = path.join(__dirname, 'Commands');
    console.log(`Loading commands from ${commandDir}`);
    fs.readdirSync(commandDir).forEach((file) => {
      if (file.endsWith('.js')) {
        const CommandImpl = require('./commands/' + file);
        const cmd = new CommandImpl.default();
        if (cmd instanceof Command) {
          this.commands.push(cmd);
        }
      }
    });
  }

  /**
   * Finds the command impl for a given message
   * @param message
   * @return Command impl if found, null otherwise
   */
  private commandForMessage(message: Message): Command|null {
    const prefix = settings.prefix;
    const command = message.content.split(' ')[0].substring(prefix.length);
    for (const cmd of this.commands) {
      if (cmd.name === command) return cmd;
    }
    return null;
  }

  /**
   * checks if a command impl can be ran using the internal handler
   * @param cmd
   */
  private canUseInternal(cmd: Command): boolean {
    return 'internalRun' in cmd;
  }
}

(async () => {
  try {
    let bot = new JohnsonBot(settings.token);
    console.log('JohnsonBot started');
    await bot.login();
  } catch (e) {
    console.error(e);
  }
})();