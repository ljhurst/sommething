import { createMcpHandler, withMcpAuth } from 'mcp-handler';
import { z } from 'zod';
import { verifyToken, createRequestScopedClient } from '@/lib/mcp/auth';
import { getCellarWines, getRatedWines } from '@/lib/mcp/wineData';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/lib/errorHandling';

const RATED_WINES_LIMIT = 50;

const handler = createMcpHandler((server) => {
  server.registerTool(
    'list_wines',
    {
      title: 'List Cellar Wines',
      description:
        "Returns every wine currently physically on hand in the user's wine cellar/fridge, " +
        'including where to find it (space/fridge name and slot number). Call this whenever ' +
        'the user asks a wine pairing question (e.g. "what pairs with salmon"), asks what to ' +
        'drink tonight, or wants gift/selection suggestions from what they actually own. There ' +
        'are at most about two dozen bottles, so this always returns the full current inventory.',
      inputSchema: z.object({}),
    },
    async (_args, ctx) => {
      const token = ctx.http?.authInfo?.token;
      if (!token) {
        return { content: [{ type: 'text', text: 'Not authenticated.' }], isError: true };
      }
      try {
        const client = createRequestScopedClient(token);
        const wines = await getCellarWines(client);
        return { content: [{ type: 'text', text: JSON.stringify(wines, null, 2) }] };
      } catch (error) {
        logger.apiError('MCP', 'list_wines', error);
        return {
          content: [{ type: 'text', text: getErrorMessage(error, 'Failed to list wines') }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    'get_rated_wines',
    {
      title: 'Get Rated Wine History',
      description:
        "Returns the user's past wine consumption records that have a thumbs-up/thumbs-down " +
        `rating (most recent first, up to ${RATED_WINES_LIMIT}), joined with wine details. ` +
        'Use this only when personalization is useful — e.g. the user references a wine they ' +
        'liked/disliked before, or explicitly asks for suggestions based on their taste/history. ' +
        'Do NOT call this for simple pairing questions like "what goes with steak" — use ' +
        'list_wines and your own wine knowledge for those.',
      inputSchema: z.object({}),
    },
    async (_args, ctx) => {
      const token = ctx.http?.authInfo?.token;
      if (!token) {
        return { content: [{ type: 'text', text: 'Not authenticated.' }], isError: true };
      }
      try {
        const client = createRequestScopedClient(token);
        const rated = await getRatedWines(client, RATED_WINES_LIMIT);
        return { content: [{ type: 'text', text: JSON.stringify(rated, null, 2) }] };
      } catch (error) {
        logger.apiError('MCP', 'get_rated_wines', error);
        return {
          content: [{ type: 'text', text: getErrorMessage(error, 'Failed to get rated wines') }],
          isError: true,
        };
      }
    }
  );
}, {});

const authHandler = withMcpAuth(handler, verifyToken, {
  required: true,
  resourceMetadataPath: '/.well-known/oauth-protected-resource',
});

export { authHandler as GET, authHandler as POST };
