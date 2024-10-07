import { t } from 'elysia';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

export const errorResponseSchema = t.Object({
  statusCode: t.Number(),
  message: t.String(),
  error: t.Optional(t.String()),
});
