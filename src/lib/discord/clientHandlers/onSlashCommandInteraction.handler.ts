import type { Interaction } from 'discord.js';
import * as kittenDB from '$lib/kittenDB';

export async function onSlashCommandInteraction(interaction: Interaction) {

  if (interaction.isCommand()) {
    console.debug(`Received command ${interaction.commandName} in guild ${interaction.guildId}`);
    const { commandName } = interaction;
    const client = interaction.client as Client;
    const command = client.commands?.get(commandName);

    if (!command) {
      console.error(`Command ${commandName} not found`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  } else {

    if (!interaction.isMessageComponent()) return;
    const client = interaction.client as Client;

    // first check if there is already an active collector for this message id
    if (client.collectors?.get(interaction.message.id)) return;

    // potentially a resume interaction
    const resume = await kittenDB.getResumeCommand(interaction.message.id);
    if (!resume) return;
    console.debug(`Resume interaction ${interaction.id} in guild ${interaction.guildId} on message ${interaction.message.id} with resume ${resume}`);

    const command = client.commands?.get(resume.command);
    if (!command || !command.resume) {
      console.error(`Command ${resume.command} not found for resume on message ${interaction.message.id}`);
      return;
    }

    try {
      await command.resume(interaction, resume.params ? JSON.parse(resume.params) : {}, resume.context ? JSON.parse(resume.context) : {});
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'There was an error while resuming this command!',
        ephemeral: true,
      });
    }
  }
}
