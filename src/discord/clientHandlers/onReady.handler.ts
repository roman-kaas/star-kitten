
export async function onReady(client: Client) {
  console.log(`Logged in as ${client.user?.tag}`);
  await global.App.refreshCommands();
}
