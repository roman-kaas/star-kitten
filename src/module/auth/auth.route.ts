import { Elysia, redirect, t } from 'elysia';
import { useEveAuth } from '$plugins';
import { CharacterAPI, characterIdFromToken } from '$eve/esi';
import { User, Character } from './models';
import { db, refreshTokenAndUpdateCharacter } from './lib';

export default (app: Elysia) => {
  return app
    .use(
      useEveAuth({
        ...global.App.config.eve,
      }),
    )
    .state({
      users: {} as Record<string, any>,
      sessions: {} as Record<number, string>,
    })
    .get('/', ({ eveauth }) => eveauth.redirect())
    .get(
      '/:discordID', // add a new character
      ({ eveauth, cookie, params }) => {
        cookie.discordID.value = params.discordID;
        cookie.discordID.maxAge = 60 * 10; // 10 min
        return eveauth.redirect('publicData');
      },
      {
        detail: {
          tags: ['auth'],
          summary: 'Authenticate via EVE Online',
        },
        response: {
          [302]: t.Null(),
        },
      },
    )
    .get(
      '/:discordID/:characterID/:scopes', // set provided scopes for a character
      ({ eveauth, cookie, params }) => {
        cookie.discordID.value = params.discordID;
        cookie.discordID.maxAge = 60 * 10; // 10 min
        cookie.characterID.value = params.characterID;
        cookie.characterID.maxAge = 60 * 10; // 10 min
        return eveauth.redirect(params.scopes);
      },
      {
        detail: {
          tags: ['auth'],
          summary: 'Authenticate via EVE Online',
        },
        response: {
          [302]: t.Null(),
        },
      },
    )
    .get(
      '/:discordID/addScopes/:characterID/:module', // add module scopes to a character
      async ({ eveauth, cookie, params }) => {
        cookie.discordID.value = params.discordID;
        cookie.discordID.maxAge = 60 * 10; // 10 min
        cookie.characterID.value = params.characterID;
        cookie.characterID.maxAge = 60 * 10; // 10 min
        const module = global.App.modules.get(params.module);
        if (!module) {
          console.error(`Module ${params.module} not found`);
          throw new Error(`Module ${params.module} not found`);
        }
        const requiredScopes = module.scopes.split(' ');

        const character = await db.getCharacter(params.characterID);
        if (!character) {
          throw new Error(`Character ${params.characterID} not found`);
        }
        const currentScopes = character.scopes;
        const set = new Set(currentScopes);
        requiredScopes.forEach((scope) => set.add(scope));
        const scopes = Array.from(set).join(' ');
        return eveauth.redirect(scopes);
      },
      {
        detail: {
          tags: ['auth'],
          summary: 'Authenticate via EVE Online',
        },
        response: {
          [302]: t.Null(),
        },
      },
    )
    .get(
      '/:discordID/removeScopes/:characterID/:module', // remove module scopes from a character
      ({ eveauth, cookie, params }) => {
        cookie.discordID.value = params.discordID;
        cookie.discordID.maxAge = 60 * 10; // 10 min
        cookie.characterID.value = params.characterID;
        cookie.characterID.maxAge = 60 * 10; // 10 min

        const module = global.App.modules.get(params.module);
        if (!module) {
          throw new Error(`Module ${params.module} not found`);
        }
        const removeScopes = module.scopes.split(' ');

        const character = db.getCharacter(params.characterID);
        if (!character) {
          throw new Error(`Character ${params.characterID} not found`);
        }
        const set = new Set(character.scopes);
        removeScopes.forEach((scope) => set.delete(scope));

        // As this is removing scopes, we can do this without user interaction
        refreshTokenAndUpdateCharacter(character.id, Array.from(set).join(' '));
        return redirect('/auth/success');
      },
      {
        detail: {
          tags: ['auth'],
          summary: 'Authenticate via EVE Online',
        },
        response: {
          [302]: t.Null(),
        },
      },
    )
    .get(
      '/callback',
      async ({ eveauth, redirect, cookie }) => {
        try {
          const token = await eveauth.validate();
          const characterID = characterIdFromToken(token.access_token);

          if (!cookie.discordID.value) {
            // only supported auth is through Discord, so we need to have a discordID cookie
            throw new Error('No discordID in cookie');
          }

          if (cookie.characterID && cookie.characterID.value && parseInt(cookie.characterID.value) !== characterID) {
            // the bot requested scopes for a different character, error out
            throw new Error(`Character ID mismatch: ${cookie.characterID.value} !== ${characterID}`);
          }

          let user = db.getUserByDiscordId(cookie.discordID.value);
          let character = db.getCharacter(characterID);

          if (!user) {
            user = User.create(cookie.discordID.value);
            db.save(user);
            console.debug(`Created user: ${user.discordID}`);
            user = db.getUserByDiscordId(cookie.discordID.value);
          }

          if (!character) {
            console.log(`Creating character: ${characterID}`);
            const data = await CharacterAPI.getCharacterPublicData(characterID);
            character = Character.create(characterID, data.name, user, token);
            db.save(character);
            character = db.getCharacter(characterID);
            if (user.mainCharacter === null) {
              user.mainCharacter = character;
              db.save(user);
            }
          } else {
            character.accessToken = token.access_token;
            character.expiresAt = new Date(token.expires_in * 1000);
            character.refreshToken = token.refresh_token;
            db.save(character);
          }

          return redirect('/auth/success');
        } catch (error) {
          console.error(`Error: ${error as string}`);
          return redirect('/auth/error');
        } finally {
          // clear cookies
          cookie.discordID.maxAge = 0;
          cookie.characterID.maxAge = 0;
        }
      },
      {
        detail: {
          tags: ['auth'],
          summary: 'EVE auth callback',
        },
      },
    )
    .get('/success', () => {
      return 'EVE auth success, you may close this browser tab.';
    })
    .get('/error', () => {
      return 'EVE auth failed, you may close this browser tab.';
    });
};
