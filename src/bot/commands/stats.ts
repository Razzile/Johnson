import {Message, MessageEmbed, TextChannel} from 'discord.js';

import settings from '../../bot.json';
import {Profile} from '../../halo';
import Command from '../command';

/**
 * Implements the stat command
 */
export default class StatsCommand extends Command {
  constructor() {
    super({
      name: 'stats',
      description: 'Get stats for a specified gamertag',
      usage: `${settings.prefix}stats [gamertag]`
    });
  }

  /**
   * runs the command
   * @param msg the message that invoked the command
   */
  async run(msg: Message): Promise<boolean> {
    let gamertag = msg.content.split(' ').slice(1).join(' ');

    let profile: Profile|null = null;
    try {
      let loadMsg = await msg.channel.send('Loading stats...');
      profile = await Profile.findProfile(gamertag);
      if (profile == null) {
        throw new Error('Could not find profile');
      }
      loadMsg.delete();
    } catch (e) {
      this.sendFailMessage({
        channel: msg.channel as TextChannel,
        title: 'Gamertag not found',
        deletable: true
      });
      return false;
    }

    let embed = this.statsEmbed(profile);
    msg.channel.send(embed);

    return true;
  }

  private statsEmbed(profile: Profile): MessageEmbed {
    let embed = new MessageEmbed();
    embed.setThumbnail(profile.emblem);
    embed.addFields([
      {name: 'Play time', value: profile.playtime},
      {name: 'Games Played', value: profile.gamesPlayed},
      {name: 'Wins', value: profile.wins, inline: true},
      {name: 'Losses', value: profile.losses, inline: true},
      {name: 'Win Ratio', value: profile.winRatio.toFixed(2)},
      {name: 'Kills', value: profile.kills, inline: true},
      {name: 'Deaths', value: profile.deaths, inline: true},
      {name: 'K/D Ratio', value: profile.killDeathRatio.toFixed(2)},
      {
        name: 'Kills per Game',
        value: profile.killsPerGame.toFixed(2),
        inline: true
      },
      {
        name: 'Deaths per Game',
        value: profile.deathsPerGame.toFixed(2),
        inline: true
      },
    ]);

    const winCount = profile.last20Games.filter(result => result == 1).length;
    const lossCount = profile.last20Games.filter(result => result == -1).length;
    embed.addField('Last 20 games', `${winCount} Wins, ${lossCount} Losses`);
    embed.addField('Current Streak', profile.streak);

    const profileUrl = encodeURI(
        `https://www.halowaypoint.com/en-us/games/halo-the-master-chief-collection/xbox-one/service-records/players/${
            profile.gamertag}`);
    embed.setAuthor(
        `${profile.gamertag} [${profile.clantag}]`, undefined, profileUrl);

    return embed;
  }
}