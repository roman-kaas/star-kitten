import type { RequestContext } from 'brisa';
import type { EVEAuth } from '@middleware';

// GET /api/auth/
export function GET(request: RequestContext) {
  const eveauth: EVEAuth =  request.store.get('eveauth');
  return eveauth.redirect();
}