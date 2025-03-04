export interface EveAuthOptions {
  client_id: string;
  client_secret: string;
  callback_url: string;
  user_agent: string;
}

const CLIENT_ID = process.env.EVE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.EVE_CLIENT_SECRET || '';
const CALLBACK_URL = process.env.EVE_CALLBACK_URL || '';
const USER_AGENT = process.env.ESI_USER_AGENT || '';

export const options: EveAuthOptions = {
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  callback_url: CALLBACK_URL,
  user_agent: USER_AGENT,
};