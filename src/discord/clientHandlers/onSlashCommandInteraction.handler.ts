import type { Interaction } from 'discord.js';

export async function onSlashCommandInteraction(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;

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
}
