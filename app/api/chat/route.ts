import { groq } from '@ai-sdk/groq';
import { streamText, tool, zodSchema } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

const NBA_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Referer': 'https://www.nba.com/',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://www.nba.com',
  'Connection': 'keep-alive',
};

function parseMinutes(minVal: any): number {
  if (typeof minVal === 'number') {
    return minVal;
  }
  if (typeof minVal === 'string') {
    if (minVal.includes(':')) {
      const [m, s] = minVal.split(':').map(Number);
      return m + (s ? s / 60 : 0);
    }
    const parsed = parseFloat(minVal);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

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
      model: groq('llama-3.3-70b-versatile'),
      messages: sanitizedMessages,
      maxSteps: 5,
      system: `You are hoopsgpt, a high-energy basketball analytics live-data agent. Your absolute highest priority is factual accuracy and providing an active, organic conversational chat stream. 
You must strictly execute every turn in the following 3-step response lifecycle:

- **Step 1: Mandatory Pre-Tool Conversational Greeting:** Before invoking any tool (like \`queryPlayerStats\`), you MUST stream a natural, hype-filled introductory chat sentence directly to the user acknowledging their request with high-energy hoops banter (e.g., "On it! Let's pull up the tape on Lauri Markkanen real quick..." or "Luka has been on an absolute tear lately, let me hook into the servers and check those numbers for you..."). You must never call a tool in absolute silence.
- **Step 2: Tool Invocation:** Execute the \`queryPlayerStats\` tool. If the user asks for a comparison between two players, you must call the tool for BOTH players (either in parallel or in sequence). The frontend UI will render the raw visual tables and metrics from the output. Do not output raw Markdown tables under any circumstances.
- **Step 3: Mandatory Post-Tool Analytical Narrative:** Once the tool successfully returns the data payload, you MUST read the JSON data string or the "HOT STREAK ALERT / baseline comparison block" returned by the tool's execution summary, immediately resume streaming, and write a fluid, high-impact narrative review paragraph (strictly under 150 words) underneath the visual card(s). Break down the player's shot profile, efficiency, or True Shooting (TS%) delta. If the user's prompt includes a qualitative or status-based question (e.g., retirement status, injuries, or personal history), you MUST directly address and answer every specific question asked using the fetched tool context (such as referencing their last season totals or active years) alongside your analytical tape-study breakdown.

CRITICAL STREAMING RESUMPTION RULE: After any tool invocation completes (or when an empty/error payload is handled), you are strictly forbidden from exiting or stopping the streaming generation loop. You MUST automatically generate an additional text payload to complete Step 3, streaming a high-energy analytical wrap-up paragraph underneath the UI component cards.
CRITICAL COMPLETION MANDATE: Once all relevant tool payloads have successfully returned data arrays to the conversation context, you must immediately resume token generation to fulfill Step 3 of the lifecycle. You must read the returned statistics, directly answer any qualitative or comparative text questions asked in the initial user prompt, and format this complete breakdown in a high-energy paragraph strictly under 150 words directly underneath the visual cards.

Strictly adhere to the following execution guardrails to prevent data hallucination:
1. **Zero Guessing / Anchoring to Tool Output:** You are forbidden from inventing, estimating, or predicting any player statistics (PPG, APG, RPG, TS%, or shooting splits). You must ONLY discuss the exact numbers returned in the \`queryPlayerStats\` tool payload. If a number is not explicitly in the tool data, it does not exist.
2. **Handle Missing Data Gracefully:** If the tool returns an empty state, an error, or indicates a player cannot be found across the cascading seasons, do not make up a legacy profile. State cleanly and energetically that the NBA API endpoint did not return active logs for that query type, and ask the user to verify the spelling or the player's active status.
3. **Markdown Table Re-engineering:** If the user asks for a table or visual data structure, do not say "I cannot make tables" and do not use raw markdown syntax. Instead, confidently state a hype hook in your Step 1/Step 3 commentary like: "I've dropped the visual analytics board below! Let's break down the film on this stretch:" or "Peep the analytics card below for the raw splits! Let's analyze the tape on this run:" and seamlessly transition straight into your narrative analysis.
4. **Contextual Enforcement:** If the tool output indicates a 'HOT STREAK ALERT', lean heavily into that narrative delta. If the delta is standard, focus on their baseline stability. Do not invent a hot streak if the tool baseline comparison does not explicitly trigger one.
5. **Identify Dynamic Game Limits:** When a user requests recent/last games, look for a specific number of games in the query (e.g., 5, 10, 15, etc.). You must pass that number as the \`limit\` parameter to the \`queryPlayerStats\` tool. If no specific number is mentioned, default to 5.
6. **Strict Current-Turn Isolation:** You are strictly forbidden from calling tools or querying statistics for players from previous turns in the conversation. You must only call the \`queryPlayerStats\` tool for the player(s) explicitly requested in the *current* user prompt. Never re-query or repeat stats for players that have already been resolved in earlier messages of the chat history.
7. **Handle Comparison Intent Guardrails:** When a comparison query involves two or more players, you are required to sequentially or concurrently invoke the \`queryPlayerStats\` tool for EACH player mentioned. Do not stop generating or exit after the first tool call returns; you must utilize your allowed execution steps to gather datasets for all target entities before moving to the final analytical phase. Use your post-tool conversational paragraph to definitively answer the comparison based on the retrieved metrics, rather than getting stuck only rendering a single player's visual history card.
8. **Low-TPM Optimization:** To preserve API token budget, keep your reasoning and narrative analysis punchy, direct, and strictly under 150 words.
9. **Intent Classification, Tool Bypass & Reality Anchor:** Before invoking any statistical tool, evaluate if the user is asking a purely qualitative, status-based, or non-statistical question regarding player retirement, roster status, or current active availability. Check your internal historical context first. For factual reference: Derrick Rose officially retired from professional basketball in September 2024 (and his jersey was retired by the Bulls on January 24, 2026). LeBron James remains fully active. If asked about a retired player's status, DO NOT execute a seasonal statistics query; bypass the tool completely and answer the text prompt definitively in a high-energy chat paragraph.
10. **Strict Tool Call Compliance:** When invoking the \`queryPlayerStats\` tool, you must generate the parameters (\`playerName\` and \`limit\`) in pure, strict JSON matching the schema properties exactly. Do not output any conversational text, thought steps, or markdown wrappers inside or immediately prior to the tool arguments block.`,
      tools: {
        queryPlayerStats: tool({
          description: 'Query live official NBA regular season statistics for a specific player by name. Can fetch career stats or recent game logs.',
          inputSchema: zodSchema(
            z.object({
              playerName: z.string().describe('The full or partial name of the player to query in this current turn. ONLY query the player requested in the most recent user prompt.'),
              queryType: z.enum(['career', 'recent']).optional().describe('The type of stats query. Use "recent" if the user wants recent games, last games, game logs, or recent stats. Defaults to "career" for general, career, or season totals queries.'),
              limit: z.number().default(5).describe('The number of recent games to fetch, defaulting to 5 if not explicitly specified by the user.'),
            })
          ),
          execute: async ({ playerName, queryType = 'career', limit }: { playerName: string; queryType?: 'career' | 'recent'; limit: number }) => {
            try {
              const targetPlayerName = playerName.trim();
              if (!targetPlayerName) {
                return 'No player name provided in this turn.';
              }

              // 1. Fetch player directory to match Name with Person ID
              const allPlayersUrl = 'https://stats.nba.com/stats/commonallplayers?IsOnlyCurrentSeason=0&LeagueID=00&Season=2023-24';
              const playerLookupRes = await fetch(allPlayersUrl, { headers: NBA_HEADERS });
              
              if (!playerLookupRes.ok) {
                return `Failed to connect to official NBA player directory (HTTP ${playerLookupRes.status}).`;
              }
              
              const playerLookupData = await playerLookupRes.json();
              const resultSet = playerLookupData.resultSets[0];
              const personIdIdx = resultSet.headers.indexOf('PERSON_ID');
              const nameIdx = resultSet.headers.indexOf('DISPLAY_FIRST_LAST');

              // Intelligent Fuzzy Matching
              let playerRow = resultSet.rowSet.find((row: any) =>
                row[nameIdx].toLowerCase().includes(targetPlayerName.toLowerCase())
              );

              if (!playerRow) {
                // Typo-tolerant split-word prefix search (e.g. "lauri markannen" -> "Lauri Markkanen")
                const searchWords = targetPlayerName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
                let maxMatches = 0;
                
                resultSet.rowSet.forEach((row: any) => {
                  const fullName = row[nameIdx].toLowerCase();
                  let matches = 0;
                  
                  searchWords.forEach(word => {
                    if (fullName.includes(word)) {
                      matches += 2; // high weight for exact match of a word
                    } else {
                      // check if word shares a prefix of length 4 or more (resolves suffix spelling typos)
                      const prefix = word.substring(0, Math.min(5, word.length));
                      if (prefix.length >= 4 && fullName.includes(prefix)) {
                        matches += 1; // partial weight
                      }
                    }
                  });
                  
                  if (matches > maxMatches) {
                    maxMatches = matches;
                    playerRow = row;
                  }
                });

                // Only accept if we have a strong matching score
                if (maxMatches < 2) {
                  playerRow = undefined;
                }
              }

              if (!playerRow) {
                return `Player "${targetPlayerName}" was not found in the official NBA player directory.`;
              }

              const playerId = playerRow[personIdIdx];
              const officialName = playerRow[nameIdx];

              const mapRow = (headers: string[], row: any[]) => {
                const obj: any = {};
                headers.forEach((h, i) => {
                  obj[h] = row[i];
                });
                return obj;
              };

              if (queryType === 'recent') {
                // Fetch recent game logs
                let logsRaw: any[] = [];
                let usedSeason = '';
                const candidateSeasons = ['2025-26', '2024-25', '2023-24'];

                for (const season of candidateSeasons) {
                  try {
                    const url = `https://stats.nba.com/stats/playergamelogs?PlayerID=${playerId}&Season=${season}&SeasonType=Regular+Season`;
                    const res = await fetch(url, { headers: NBA_HEADERS });
                    if (res.ok) {
                      const data = await res.json();
                      const logsSet = data.resultSets?.[0];
                      if (logsSet && logsSet.rowSet && logsSet.rowSet.length > 0) {
                        logsRaw = logsSet.rowSet.map((row: any[]) => mapRow(logsSet.headers, row));
                        usedSeason = season;
                        break;
                      }
                    }
                  } catch (err) {
                    console.error(`Error fetching playergamelogs for season ${season}:`, err);
                  }
                }

                if (logsRaw.length === 0) {
                  return `No recent games or game logs found for ${officialName} in the recent seasons (2025-26, 2024-25, 2023-24).`;
                }

                // Dynamic slice limit
                const gameLimit = limit || 5;
                const recentGames = logsRaw.slice(0, gameLimit);
                const count = recentGames.length;

                // Compute averages
                let totalPts = 0;
                let totalAst = 0;
                let totalReb = 0;
                let totalMin = 0;
                let totalFga = 0;
                let totalFta = 0;

                recentGames.forEach((g) => {
                  totalPts += Number(g.PTS || 0);
                  totalAst += Number(g.AST || 0);
                  totalReb += Number(g.REB || 0);
                  totalMin += parseMinutes(g.MIN);
                  totalFga += Number(g.FGA || 0);
                  totalFta += Number(g.FTA || 0);
                });

                const avgPts = totalPts / count;
                const avgAst = totalAst / count;
                const avgReb = totalReb / count;
                const avgMin = totalMin / count;

                // True Shooting formula: PTS / (2 * (FGA + 0.44 * FTA))
                const denominator = 2 * (totalFga + 0.44 * totalFta);
                const tsPct = denominator > 0 ? parseFloat((totalPts / denominator).toFixed(3)) : 0;

                // Estimates for advanced ratings
                const usgEst = Math.min(38, Math.max(12, parseFloat((15 + (avgPts * 0.8) + (avgAst * 0.4)).toFixed(1))));
                const perEst = Math.min(32, Math.max(8, parseFloat((10 + (avgPts * 0.6) + (avgAst * 0.5) + avgReb * 0.4).toFixed(1))));
                const wsEst = Math.min(20, Math.max(0.1, parseFloat((count * (perEst / 200) * 1.2).toFixed(1))));

                // Baseline comparison to check for a Hot Streak
                let hotStreakText = '';
                try {
                  const careerStatsUrl = `https://stats.nba.com/stats/playercareerstats?PerMode=PerGame&PlayerID=${playerId}&LeagueID=00`;
                  const careerRes = await fetch(careerStatsUrl, { headers: NBA_HEADERS });
                  if (careerRes.ok) {
                    const careerData = await careerRes.json();
                    const seasonTotalsSet = careerData.resultSets.find((set: any) => set.name === 'SeasonTotalsRegularSeason');
                    const seasonsRaw = seasonTotalsSet?.rowSet.map((row: any[]) => mapRow(seasonTotalsSet.headers, row)) || [];
                    
                    if (seasonsRaw.length > 0) {
                      const latestSeason = seasonsRaw[seasonsRaw.length - 1];
                      const seasonPpg = Number(latestSeason.PTS || 0);
                      const seasonFga = Number(latestSeason.FGA || 0);
                      const seasonFta = Number(latestSeason.FTA || 0);
                      const denominatorSeason = 2 * (seasonFga + 0.44 * seasonFta);
                      const seasonTsPct = denominatorSeason > 0 ? seasonPpg / denominatorSeason : 0;
                      
                      const ppgDiff = avgPts - seasonPpg;
                      const tsDiff = tsPct - seasonTsPct;
                      
                      const isPpgHot = ppgDiff >= 2.0;
                      const isTsHot = tsDiff >= 0.03;
                      
                      if (isPpgHot || isTsHot) {
                        hotStreakText = `HOT STREAK ALERT: ${officialName} is currently on a hot streak! Over the last ${gameLimit} games, they are averaging ${avgPts.toFixed(1)} PPG on ${(tsPct * 100).toFixed(1)}% TS%, compared to their season baseline of ${seasonPpg.toFixed(1)} PPG on ${(seasonTsPct * 100).toFixed(1)}% TS% (Diff: ${ppgDiff >= 0 ? '+' : ''}${ppgDiff.toFixed(1)} PPG, ${tsDiff >= 0 ? '+' : ''}${(tsDiff * 100).toFixed(1)}% TS%).`;
                      } else {
                        hotStreakText = `Performance Baseline Comparison: Over the last ${gameLimit} games, they are averaging ${avgPts.toFixed(1)} PPG on ${(tsPct * 100).toFixed(1)}% TS%, compared to their season baseline of ${seasonPpg.toFixed(1)} PPG on ${(seasonTsPct * 100).toFixed(1)}% TS% (Diff: ${ppgDiff >= 0 ? '+' : ''}${ppgDiff.toFixed(1)} PPG, ${tsDiff >= 0 ? '+' : ''}${(tsDiff * 100).toFixed(1)}% TS%).`;
                      }
                    }
                  }
                } catch (err) {
                  console.error('Error fetching baseline stats for comparison:', err);
                }

                // Map individual games to seasons layout + add an average row
                const seasons = [
                  ...recentGames.map((g, index) => ({
                    id: `g-${index}`,
                    seasonYear: `${g.GAME_DATE ? g.GAME_DATE.substring(5, 10) : ''} ${g.MATCHUP || ''}`,
                    gamesPlayed: g.WL || 1,
                    minutesPerGame: parseMinutes(g.MIN),
                    pointsPerGame: g.PTS,
                    assistsPerGame: g.AST,
                    reboundsPerGame: g.REB,
                  })),
                  {
                    id: 'g-avg',
                    seasonYear: `Last ${gameLimit} Avg`,
                    gamesPlayed: count,
                    minutesPerGame: parseFloat(avgMin.toFixed(1)),
                    pointsPerGame: parseFloat(avgPts.toFixed(1)),
                    assistsPerGame: parseFloat(avgAst.toFixed(1)),
                    reboundsPerGame: parseFloat(avgReb.toFixed(1)),
                  }
                ];

                const advancedStats = [
                  {
                    id: 'adv-avg',
                    seasonYear: `Last ${gameLimit} Avg`,
                    trueShootingPercentage: tsPct,
                    usagePercentage: usgEst,
                    playerEfficiencyRating: perEst,
                    winShares: wsEst,
                  }
                ];

                const gamesText = recentGames.map((g) => {
                  return `${g.GAME_DATE ? g.GAME_DATE.substring(0, 10) : ''} ${g.MATCHUP || ''} (${g.WL || ''}): ${g.MIN} Min, ${g.PTS} PTS, ${g.AST} AST, ${g.REB} REB (FG%: ${g.FG_PCT ? (g.FG_PCT * 100).toFixed(1) : '0.0'}%)`;
                }).join('\n');

                const summary = `Recent games game logs for ${officialName} (Person ID: ${playerId}, Season: ${usedSeason}):\n\n${gamesText}\n\nLast ${count} Games Averages:\n${avgMin.toFixed(1)} MPG, ${avgPts.toFixed(1)} PPG, ${avgAst.toFixed(1)} APG, ${avgReb.toFixed(1)} RPG, TS%: ${(tsPct * 100).toFixed(1)}%\n\n${hotStreakText}`;

                const currentTeam = recentGames[0]?.TEAM_ABBREVIATION || 'N/A';
                const playerAge = recentGames[0]?.PLAYER_AGE || null;

                return {
                  summary,
                  player: {
                    name: officialName,
                    position: 'NBA Player',
                    age: playerAge,
                    currentTeam: currentTeam,
                  },
                  seasons,
                  advancedStats,
                };

              } else {
                // Fetch career / season totals
                const careerStatsUrl = `https://stats.nba.com/stats/playercareerstats?PerMode=PerGame&PlayerID=${playerId}&LeagueID=00`;
                const statsRes = await fetch(careerStatsUrl, { headers: NBA_HEADERS });

                if (!statsRes.ok) {
                  return `Failed to fetch career statistics for ${officialName} (Person ID: ${playerId}) from NBA servers.`;
                }

                const statsData = await statsRes.json();
                const seasonTotalsSet = statsData.resultSets.find((set: any) => set.name === 'SeasonTotalsRegularSeason');
                const careerTotalsSet = statsData.resultSets.find((set: any) => set.name === 'CareerTotalsRegularSeason');

                const seasonsRaw = seasonTotalsSet?.rowSet.map((row: any[]) => mapRow(seasonTotalsSet.headers, row)) || [];
                const careerRaw = careerTotalsSet?.rowSet.map((row: any[]) => mapRow(careerTotalsSet.headers, row))[0] || null;

                // Parse and format season box-score stats
                const seasons = seasonsRaw.map((s: any, index: number) => ({
                  id: `s-${index}`,
                  seasonYear: parseInt(s.SEASON_ID.split('-')[0]),
                  gamesPlayed: s.GP,
                  minutesPerGame: s.MIN,
                  pointsPerGame: s.PTS,
                  assistsPerGame: s.AST,
                  reboundsPerGame: s.REB,
                }));

                // Parse and format advanced stats (calculating TS% and deriving other stats)
                const advancedStats = seasonsRaw.map((s: any, index: number) => {
                  const pts = s.PTS || 0;
                  const fga = s.FGA || 0;
                  const fta = s.FTA || 0;
                  
                  // Calculate True Shooting Percentage formula: PTS / (2 * (FGA + 0.44 * FTA))
                  const denominator = 2 * (fga + 0.44 * fta);
                  const tsPct = denominator > 0 ? parseFloat((pts / denominator).toFixed(3)) : 0;

                  const ppg = s.PTS || 0;
                  const apg = s.AST || 0;
                  
                  // USG% estimate
                  const usgEst = Math.min(38, Math.max(12, parseFloat((15 + (ppg * 0.8) + (apg * 0.4)).toFixed(1))));
                  
                  // PER estimate
                  const perEst = Math.min(32, Math.max(8, parseFloat((10 + (ppg * 0.6) + (apg * 0.5) + (s.REB || 0) * 0.4).toFixed(1))));
                  
                  // Win shares estimate
                  const wsEst = Math.min(20, Math.max(0.1, parseFloat(((s.GP || 1) * (perEst / 200) * 1.2).toFixed(1))));

                  return {
                    id: `adv-${index}`,
                    seasonYear: parseInt(s.SEASON_ID.split('-')[0]),
                    trueShootingPercentage: tsPct,
                    usagePercentage: usgEst,
                    playerEfficiencyRating: perEst,
                    winShares: wsEst,
                  };
                });

                // Format text summary for the AI model's context
                const seasonsText = seasonsRaw.map((s: any) => 
                  `${s.SEASON_ID} (${s.TEAM_ABBREVIATION}): ${s.GP} GP, ${s.MIN} Min, ${s.PTS} PPG, ${s.AST} APG, ${s.REB} RPG (FG%: ${(s.FG_PCT * 100).toFixed(1)}%)`
                ).join('\n');

                const careerText = careerRaw 
                  ? `Career Totals: ${careerRaw.GP} GP, ${careerRaw.MIN} Min, ${careerRaw.PTS} PPG, ${careerRaw.AST} APG, ${careerRaw.REB} RPG (FG%: ${(careerRaw.FG_PCT * 100).toFixed(1)}%)`
                  : 'Career Totals: N/A';

                const summary = `Official NBA stats for ${officialName} (Person ID: ${playerId}):\n\nRegular Season:\n${seasonsText}\n\n${careerText}`;

                const currentTeam = seasonsRaw[seasonsRaw.length - 1]?.TEAM_ABBREVIATION || 'N/A';
                const playerAge = seasonsRaw[seasonsRaw.length - 1]?.PLAYER_AGE || null;

                return {
                  summary,
                  player: {
                    name: officialName,
                    position: 'NBA Player',
                    age: playerAge,
                    currentTeam: currentTeam,
                  },
                  seasons,
                  advancedStats,
                };
              }
            } catch (err: any) {
              console.error('Error fetching from stats.nba.com:', err);
              return `Failed to complete query for "${playerName}" due to connection error: ${err.message || err}`;
            }
          },
        }),
      },
    } as any);

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
