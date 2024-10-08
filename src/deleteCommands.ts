import { deleteCommands } from "$discord";
import { Client as DjsClient, GatewayIntentBits } from "discord.js";

const token = process.env.DISCORD_BOT_TOKEN;
const appId = process.env.DISCORD_APP_ID;
const guildId = process.env.DISCORD_TEST_GUILD_ID;

const discord = new DjsClient({ intents: [GatewayIntentBits.Guilds] }) as Client;
discord.once("ready", async (client: Client) => {
  console.log(`Discord logged in as in as ${client.user?.tag}`);
  console.log({ token, appId, guildId });
  await deleteCommands(discord, { token, appId, guildId });
  process.exit();
});
discord.login(token);
