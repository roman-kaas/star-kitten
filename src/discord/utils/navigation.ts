import { MessageComponentInteraction, CommandInteraction, EmbedBuilder, InteractionResponse, type Interaction, type CacheType } from 'discord.js';
import { errorResponse, validateEmbeds } from './embeds';


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
  interaction: MessageComponentInteraction | CommandInteraction;
  pages: Page<any>[];
  key: string; // key of the initial page
  context: any; // context of the initial page
  updateContext: (key: string, context: any) => Promise<string>;
  timeout?: number; // timeout in ms, default 5 minutes
}

export const useNavigation = async ({
  interaction: initialInteraction,
  pages,
  key: initialPage = '',
  context,
  updateContext,
  timeout = 1000 * 60 * 2, // 2 minutes
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

  const page = await getPage(currentPage, context);
  const pageContent = await page.content(context);
  if (pageContent.type === 'page') {
    try {
      validateEmbeds(...(pageContent.embeds || []));
      await initialInteraction.editReply(pageContent);
    } catch (error) {
      await initialInteraction.editReply(errorResponse(error.message));
      return;
    }
  }
  const currentMessage = await initialInteraction.editReply({
    ...pageContent,
    fetchReply: true,
  } as any);
  let currentInteraction = initialInteraction;

  const filter = (i: MessageComponentInteraction) => {
    return i.isMessageComponent() && i.message.id === currentMessage.id;
  };

  const collector = currentMessage.createMessageComponentCollector({
    filter,
    time: timeout,
  });

  collector.on('collect', async (i) => {
    collector.resetTimer();
    currentPage = i.customId;
    currentInteraction = i;
    const page = await getPage(currentPage, context);
    const pageContent = await page.content(context);

    if (pageContent.type === 'modal') {
      await currentInteraction.showModal(pageContent);
    } else {
      await currentInteraction.deferUpdate();

      try {
        validateEmbeds(...(pageContent.embeds || []));
        await currentInteraction.editReply(pageContent);
      } catch (error) {
        await currentInteraction.editReply(errorResponse(error.message));
        return;
      }
    }
    collector.resetTimer();
  });

  collector.on('end', async (_, reason) => {
    if (reason !== 'messageDelete') {
      try {
        currentInteraction.editReply({
          components: [],
        });
      } catch (err) {
        console.error(err);
      }
    }
  });

  return currentMessage;
};
