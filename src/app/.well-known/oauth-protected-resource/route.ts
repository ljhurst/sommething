import { protectedResourceHandler, metadataCorsOptionsRequestHandler } from 'mcp-handler';

const handler = protectedResourceHandler({
  authServerUrls: [`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`],
});

const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
