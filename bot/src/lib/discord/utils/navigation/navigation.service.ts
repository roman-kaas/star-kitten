import {
  MessageComponentInteraction,
  CommandInteraction,
  EmbedBuilder,
  InteractionResponse,
  type Interaction,
  type CacheType,
  type MessageComponentType,
  Message,
} from 'discord.js';
import { errorResponse, validateEmbeds } from '../embeds';
import type { ResumeableInteraction } from '../loadCommands';
import { ResumeCommand } from 'star-kitten-lib/db';

interface ModalContent {
  type: 'modal';
  customId: string;
  title: string;
  components: any[];
}

interface PageContent {
  type: 'page';
  embeds?: EmbedBuilder[];
  components?: any[];
  ephemeral?: boolean;
  content?: string;
}

export interface Page<T extends { disabled?: boolean }> {
  key: string;
  content: (context: T) => Promise<PageContent | ModalContent>;
}

export interface NavigationConfig {
  interaction: MessageComponentInteraction | CommandInteraction | ResumeableInteraction;
  pages: Page<any>[];
  key: string; // key of the initial page
  context: any; // context of the initial page
  updateContext: (key: string, context: any) => Promise<string>;
  timeout?: number; // timeout in ms, default 5 minutes
  saveResume: (messageId: string, context?: any) => void;
}

export const useNavigation = async ({
  interaction: initialInteraction,
  pages,
  key: initialPage = '',
  context,
  updateContext,
  timeout = 1000 * 15, // 15 seconds
  saveResume
}: NavigationConfig) => {
  const pageMap = new Map<string, Page<any>>();
  for (const page of pages) {
    pageMap.set(page.key, page);
  }

  const getPage = async (key: string, context: any) => {
    const k = await updateContext(key, context);
    const page = pageMap.get(k);
    if (!page) {
      throw new Error(`Page with key ${k} not found`);
    }
    return page;
  };

  let currentPage = initialPage;
  if (!currentPage) {
    currentPage = pages[0].key;
  }

  let message: Message | InteractionResponse | null = null;

  const page = await getPage(currentPage, context);
  const pageContent = await page.content(context);
  if (initialInteraction.isCommand() && pageContent.type === 'page') {
    try {
      validateEmbeds(...(pageContent.embeds || []));
      message = await initialInteraction.editReply({
        ...pageContent,
        fetchReply: true,
      } as any);
    } catch (error) {
      await initialInteraction.editReply(errorResponse(error.message));
      return;
    }
  } else if (!initialInteraction.isCommand() && pageContent.type === 'page') {
    currentPage = initialInteraction.customId;
    const page = await getPage(currentPage, context);
    const pageContent = await page.content(context);

    if (pageContent.type === 'modal') {
      await initialInteraction.showModal(pageContent);
    } else {
      await initialInteraction.deferUpdate();

      try {
        validateEmbeds(...(pageContent.embeds || []));
        message = await initialInteraction.editReply({
          ...pageContent,
          fetchReply: true,
        } as any);
      } catch (error) {
        await initialInteraction.editReply(errorResponse(error.message));
        return;
      }
    }
  }

  if (!message) {
    message = await initialInteraction.editReply({
      ...pageContent,
      fetchReply: true,
    } as any);
  }

  const filter = (i: MessageComponentInteraction) => {
    return i.isMessageComponent() && i.message.id === message.id;
  };

  const collector = message.createMessageComponentCollector({
    filter,
    time: timeout,
  });

  const client = initialInteraction.client as Client;
  client.collectors?.set(message.id, true);


  collector.on('collect', async (i) => {
    collector.resetTimer();
    currentPage = i.customId;
    const page = await getPage(currentPage, context);
    const pageContent = await page.content(context);

    if (pageContent.type === 'modal') {
      await i.showModal(pageContent);
    } else {
      await i.deferUpdate();

      try {
        validateEmbeds(...(pageContent.embeds || []));
        await i.editReply(pageContent);
      } catch (error) {
        await i.editReply(errorResponse(error.message));
        return;
      }
    }
    collector.resetTimer();
  });

  collector.on('end', async (_, reason) => {
    client.collectors?.set(message.id, false);

    if (reason !== 'messageDelete') {
      // save the state so we can resume later
      saveResume(message.id, context);
      // try {
      //   currentInteraction.editReply({
      //     components: [],
      //   });
      // } catch (err) {
      //   console.error(err);
      // }
    } else {
      // delete the resume if it exists and the message was deleted
      ResumeCommand.delete(message.id);
    }
  });

  return message;
};
