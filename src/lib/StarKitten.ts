import Elysia from "elysia";
import html from "@elysiajs/html";
import { Client as DjsClient, Collection, GatewayIntentBits, Events } from "discord.js";
import { logger } from '$lib';
import { loadModules } from "$lib/utils";
import { useFileRouting } from '$plugins';
import { loadCommands, refreshCommands, type Command } from '$discord/utils';
import { onReady, onSlashCommandInteraction } from "$discord/clientHandlers";
import type { EveAuthOptions } from "$eve/esi/auth";

export interface AppOptions {
  debug: boolean;
  useLogger: boolean;
  port: number;
  baseUrl?: string;
  discord: {
    token: string;
    appId: string;
    secret: string;
    testGuildId: string;
  };
  eve: EveAuthOptions,
}

export interface AppModule {
  name: string;
  description: string;
  scopes: string;
  dependencies: string[];
  database?: {
    name: string;
    path: string;
    modelsPattern: string;
    modelsDir: string;
  };
  init?: () => Promise<void>;
}

export class StarKitten {
  options: AppOptions;
  modules: Map<string, AppModule>;
  commands: Collection<string, Command>;
  router: Elysia;
  discord: Client;

  private didInit: boolean = false;

  constructor() {
    this.modules = new Map<string, AppModule>();
    this.commands = new Collection<string, Command>();
  }

  async init(options: Partial<AppOptions> = {}) {
    if (this.didInit) {
      return;
    }
    this.didInit = true;

    console.debug('Initializing StarKitten');

    this.options = {
      debug: options?.debug || process.env.DEBUG === 'true',
      useLogger: options?.useLogger || true,
      port: options?.port || parseInt(process.env.PORT || '3000'),
      baseUrl: options?.baseUrl || process.env.BASE_URL,
      discord: {
        token: options?.discord?.token || process.env.DISCORD_BOT_TOKEN,
        appId: options?.discord?.appId || process.env.DISCORD_APP_ID,
        secret: options?.discord?.secret || process.env.DISCORD_APP_SECRET,
        testGuildId: options?.discord?.testGuildId || process.env.DISCORD_TEST_GUILD_ID,
      },
      eve: {
        client_id: options?.eve?.client_id || process.env.EVE_CLIENT_ID,
        client_secret: options?.eve?.client_secret || process.env.EVE_CLIENT_SECRET,
        callback_url: options?.eve?.callback_url || process.env.EVE_CALLBACK_URL,
        user_agent: options?.eve?.user_agent || process.env.EVE_USER_AGENT,
      },
    };


    if (this.options.useLogger) {
      logger.init();
    }

    this.modules = await loadModules();

    this.router = new Elysia()
      .use(html())
      .use(useFileRouting)
      .onError(({ code, set }) => {
        set.headers = { 'Content-Type': 'text/html' };
        switch (code) {
          default:
          case 'NOT_FOUND':
            set.status = 404;
            return 'Not Found';
          case 'INTERNAL_SERVER_ERROR':
            set.status = 500;
            return 'Internal Server Error';
          case 'VALIDATION':
            set.status = 400;
            return 'Validation Error';
        }
      }) as any;

    this.discord = new DjsClient({
      intents: [GatewayIntentBits.Guilds],
    }) as Client;
    this.discord.commands = await loadCommands({
      commands: new Collection(),
      commandDir: 'src',
      pattern: '**/*.command.{js,ts}',
    });
    this.discord.once(Events.ClientReady, onReady);
    this.discord.on(Events.InteractionCreate, onSlashCommandInteraction);

    return this;
  }

  async start() {

    if (!this.didInit) {
      await this.init();
    }

    this.discord.login(this.options.discord.token);
    this.router.listen(this.options.port);
    console.log(`Server is running on port ${this.options.port}`);

    return this;
  }

  refreshCommands() {
    return refreshCommands(this.discord, {
      token: this.options.discord.token,
      appId: this.options.discord.appId,
      guildId: this.options.discord.testGuildId,
    });
  }

  refreshModules() {
    return loadModules();
  }

  get baseUrl() {
    return this.options.baseUrl;
  }

  get config() {
    return this.options;
  }
}
