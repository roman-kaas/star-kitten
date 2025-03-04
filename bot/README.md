# Star Kitten Discord Bot

A Discord bot for [EVE Online](https://www.eveonline.com/).

# [Click this link to use this bot!](https://discord.com/oauth2/authorize?client_id=1288711114388930601)

## Running the Bot

This bot runs on [Bun](https://bun.sh/)! To install, run one of the following commands.

_Linux & MacOS_

```bash
curl -fsSL https://bun.sh/install | bash
```

_Windows_

```bash
powershell -c "irm bun.sh/install.ps1 | iex"
```

---

Install dependencies.

```bash
bun install
```

Download static eve reference data & Hoboleaks archive from [EVE Ref](https://everef.net/).

```bash
bun run get-data
```

Run the bot locally.

```bash
bun run dev
```

## Environment Variables

Create a .env file in the root directory with the following values:

```yaml
#General
BASE_URL=http://localhost:3000
DEBUG=true
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# EVE
EVE_CLIENT_ID=YOUR_EVE_CLIENT_ID
EVE_CLIENT_SECRET=YOUR_EVE_SECRET
EVE_CALLBACK_URL=http://localhost:3000/auth/callback
ESI_USER_AGENT=ADD_YOUR_USER_AGENT_INFO_HERE

#Discord
DISCORD_APP_ID=YOUR_APP_ID
DISCORD_CLIENT_SECRET=YOUR_CLIENT_SECRET
DISCORD_PUBLIC_KEY=YOUR_PUBLIC_KEY
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN

# ID of a test server to have immediate command refreshes
DISCORD_TEST_GUILD_ID=YOUR_TEST_SERVER_ID


```
