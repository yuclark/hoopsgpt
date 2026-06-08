import { db } from '@/src/db';
import { players, playerSeasons, advancedStats } from '@/src/db/schema';

async function main() {
  console.log('Seeding database with NBA player metrics...');
  
  // 1. Clear existing records in reverse order of foreign key dependencies
  await db.delete(advancedStats);
  await db.delete(playerSeasons);
  await db.delete(players);

  // 2. Insert the complete, verified datasets
  const insertedPlayers = await db.insert(players).values([
    {
      name: 'Shai Gilgeous-Alexander',
      position: 'PG',
      age: 27,
      currentTeam: 'Oklahoma City Thunder',
    },
    {
      name: 'Nikola Jokic',
      position: 'C',
      age: 31,
      currentTeam: 'Denver Nuggets',
    },
    {
      name: 'Luka Doncic',
      position: 'PG',
      age: 27,
      currentTeam: 'Dallas Mavericks',
    },
  ]).returning();

  const sga = insertedPlayers.find(p => p.name === 'Shai Gilgeous-Alexander')!;
  const jokic = insertedPlayers.find(p => p.name === 'Nikola Jokic')!;
  const doncic = insertedPlayers.find(p => p.name === 'Luka Doncic')!;

  console.log('Inserted players. Inserting player seasons...');

  // Player seasons with regular season box score stats
  await db.insert(playerSeasons).values([
    // Shai Gilgeous-Alexander
    {
      playerId: sga.id,
      seasonYear: 2024,
      gamesPlayed: 75,
      minutesPerGame: 34.0,
      pointsPerGame: 30.1,
      assistsPerGame: 6.2,
      reboundsPerGame: 5.5,
    },
    {
      playerId: sga.id,
      seasonYear: 2023,
      gamesPlayed: 68,
      minutesPerGame: 35.5,
      pointsPerGame: 31.4,
      assistsPerGame: 5.5,
      reboundsPerGame: 4.8,
    },
    // Nikola Jokic
    {
      playerId: jokic.id,
      seasonYear: 2024,
      gamesPlayed: 79,
      minutesPerGame: 34.6,
      pointsPerGame: 26.4,
      assistsPerGame: 9.0,
      reboundsPerGame: 12.4,
    },
    {
      playerId: jokic.id,
      seasonYear: 2023,
      gamesPlayed: 69,
      minutesPerGame: 33.7,
      pointsPerGame: 24.5,
      assistsPerGame: 9.8,
      reboundsPerGame: 11.8,
    },
    // Luka Doncic
    {
      playerId: doncic.id,
      seasonYear: 2024,
      gamesPlayed: 70,
      minutesPerGame: 37.5,
      pointsPerGame: 33.9,
      assistsPerGame: 9.8,
      reboundsPerGame: 9.2,
    },
    {
      playerId: doncic.id,
      seasonYear: 2023,
      gamesPlayed: 66,
      minutesPerGame: 36.2,
      pointsPerGame: 32.4,
      assistsPerGame: 8.0,
      reboundsPerGame: 8.6,
    },
  ]);

  console.log('Inserted player seasons. Inserting advanced stats...');

  // Advanced metrics
  await db.insert(advancedStats).values([
    // Shai Gilgeous-Alexander
    {
      playerId: sga.id,
      seasonYear: 2024,
      trueShootingPercentage: 0.636,
      usagePercentage: 32.9,
      playerEfficiencyRating: 29.3,
      winShares: 14.6,
    },
    {
      playerId: sga.id,
      seasonYear: 2023,
      trueShootingPercentage: 0.626,
      usagePercentage: 32.8,
      playerEfficiencyRating: 27.2,
      winShares: 11.4,
    },
    // Nikola Jokic
    {
      playerId: jokic.id,
      seasonYear: 2024,
      trueShootingPercentage: 0.650,
      usagePercentage: 31.2,
      playerEfficiencyRating: 31.0,
      winShares: 17.0,
    },
    {
      playerId: jokic.id,
      seasonYear: 2023,
      trueShootingPercentage: 0.701,
      usagePercentage: 27.2,
      playerEfficiencyRating: 31.5,
      winShares: 14.9,
    },
    // Luka Doncic
    {
      playerId: doncic.id,
      seasonYear: 2024,
      trueShootingPercentage: 0.617,
      usagePercentage: 35.5,
      playerEfficiencyRating: 28.1,
      winShares: 12.0,
    },
    {
      playerId: doncic.id,
      seasonYear: 2023,
      trueShootingPercentage: 0.605,
      usagePercentage: 37.6,
      playerEfficiencyRating: 28.7,
      winShares: 10.2,
    },
  ]);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
