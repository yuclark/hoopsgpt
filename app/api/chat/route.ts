import { google } from '@ai-sdk/google';
import { streamText, tool, zodSchema } from 'ai';
import { z } from 'zod';
import { db } from '@/src/db';
import { players } from '@/src/db/schema';
import { ilike } from 'drizzle-orm';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Sanitize incoming UIMessages to standard CoreMessage shape
    const sanitizedMessages = messages.map((m: any) => {
      let content = m.content || '';
      if (Array.isArray(m.parts)) {
        content = m.parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join('\n');
      }
      return {
        role: m.role,
        content: content,
      };
    });

    const result = streamText({
      model: google('gemini-2.5-flash'),
      messages: sanitizedMessages,
      system: `You are "hoopsgpt", an expert basketball analyst. You interface with a Postgres database containing Basketball-Reference metrics.
Use the tool queryPlayerStats to answer user questions about player regular season stats and advanced analytics. Always explain the numbers and metrics with deep basketball context when responding.`,
      tools: {
        queryPlayerStats: tool({
          description: 'Query regular season and advanced statistics for a specific NBA player by name.',
          inputSchema: zodSchema(
            z.object({
              playerName: z.string().describe('The full or partial name of the player to query.'),
            })
          ),
          execute: async ({ playerName }: { playerName: string }) => {
            const player = await db.query.players.findFirst({
              where: ilike(players.name, `%${playerName}%`),
              with: {
                seasons: true,
                advancedStats: true,
              },
            });

            if (!player) {
              return `Player "${playerName}" was not found in the database.`;
            }

            return {
              player: {
                id: player.id,
                name: player.name,
                position: player.position,
                age: player.age,
                currentTeam: player.currentTeam,
              },
              seasons: player.seasons,
              advancedStats: player.advancedStats,
            };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
