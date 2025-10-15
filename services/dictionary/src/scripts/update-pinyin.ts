#!/usr/bin/env ts-node

/**
 * Script to update pinyin data in database using corrected DSL parser
 * Usage: ts-node update-pinyin.ts
 */

import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import { createDslParser, DslEntry } from '../utils/dsl-parser';

const prisma = new PrismaClient();

interface UpdateStats {
  charactersUpdated: number;
  charactersAdded: number;
  charactersSkipped: number;
  examplesUpdated: number;
  examplesAdded: number;
  examplesSkipped: number;
  phrasesUpdated: number;
  phrasesAdded: number;
  phrasesSkipped: number;
  errors: number;
  startTime: number;
}

const stats: UpdateStats = {
  charactersUpdated: 0,
  charactersAdded: 0,
  charactersSkipped: 0,
  examplesUpdated: 0,
  examplesAdded: 0,
  examplesSkipped: 0,
  phrasesUpdated: 0,
  phrasesAdded: 0,
  phrasesSkipped: 0,
  errors: 0,
  startTime: Date.now(),
};

/**
 * Update characters with pinyin data
 */
async function updateCharactersBatch(entries: DslEntry[]): Promise<void> {
  for (const entry of entries) {
    try {
      // Skip entries without Chinese characters or pinyin
      if (!entry.simplified || !entry.pinyin || entry.simplified.trim() === '') {
        continue;
      }

      // Check if character exists
      const existing = await prisma.character.findUnique({
        where: { simplified: entry.simplified },
      });

      if (existing) {
        // Update strategy: update if current pinyin is null OR new pinyin is not empty
        if (!existing.pinyin || entry.pinyin.trim() !== '') {
          await prisma.character.update({
            where: { id: existing.id },
            data: { pinyin: entry.pinyin },
          });
          stats.charactersUpdated++;
        } else {
          stats.charactersSkipped++;
        }
      } else {
        // Create new character
        await prisma.character.create({
          data: {
            simplified: entry.simplified,
            traditional: entry.traditional || null,
            pinyin: entry.pinyin,
          },
        });
        stats.charactersAdded++;
      }
    } catch (error) {
      console.error(`Error updating character "${entry.headword}":`, error);
      stats.errors++;
    }
  }
}

/**
 * Update examples with pinyin data
 */
async function updateExamplesBatch(entries: DslEntry[]): Promise<void> {
  // Extract all unique simplified characters from the batch
  const simplifiedChars = [...new Set(
    entries
      .filter(entry => entry.simplified)
      .map(entry => entry.simplified!)
  )];

  if (simplifiedChars.length === 0) return;

  // Batch fetch all characters at once
  const characters = await prisma.character.findMany({
    where: {
      simplified: { in: simplifiedChars }
    },
    select: { id: true, simplified: true }
  });

  // Create a map for quick lookup
  const charMap = new Map(
    characters.map(char => [char.simplified, char.id])
  );

  for (const entry of entries) {
    try {
      if (!entry.simplified || !entry.pinyin || !entry.definitions.length) continue;

      const characterId = charMap.get(entry.simplified);
      if (!characterId) continue;

      // Check if example already exists
      const existingExample = await prisma.example.findFirst({
        where: {
          characterId,
          chinese: entry.headword,
        },
      });

      if (existingExample) {
        // Update if current pinyin is null OR new pinyin is not empty
        if (!existingExample.pinyin || entry.pinyin.trim() !== '') {
          await prisma.example.update({
            where: { id: existingExample.id },
            data: { pinyin: entry.pinyin },
          });
          stats.examplesUpdated++;
        } else {
          stats.examplesSkipped++;
        }
      } else {
        // Create new example
        await prisma.example.create({
          data: {
            characterId,
            chinese: entry.headword,
            russian: entry.definitions[0].translation,
            pinyin: entry.pinyin,
          },
        });
        stats.examplesAdded++;
      }
    } catch (error) {
      console.error(`Error updating example "${entry.headword}":`, error);
      stats.errors++;
    }
  }
}

/**
 * Update phrases with pinyin data
 */
async function updatePhrasesBatch(entries: DslEntry[]): Promise<void> {
  for (const entry of entries) {
    try {
      // Extract Chinese from content
      const chineseMatches = entry.content.match(/[\u4e00-\u9fff]+/g);
      if (!chineseMatches || chineseMatches.length === 0 || !entry.pinyin) {
        continue;
      }

      const chinese = chineseMatches.join('');
      const russian = entry.headword;

      // Check if phrase exists
      const existing = await prisma.phrase.findFirst({
        where: {
          AND: [
            { russian: russian },
            { chinese: chinese },
          ],
        },
      });

      if (existing) {
        // Update if current pinyin is null OR new pinyin is not empty
        if (!existing.pinyin || entry.pinyin.trim() !== '') {
          await prisma.phrase.update({
            where: { id: existing.id },
            data: { pinyin: entry.pinyin },
          });
          stats.phrasesUpdated++;
        } else {
          stats.phrasesSkipped++;
        }
      } else {
        // Create new phrase
        await prisma.phrase.create({
          data: {
            russian,
            chinese,
            pinyin: entry.pinyin,
          },
        });
        stats.phrasesAdded++;
      }
    } catch (error) {
      console.error(`Error updating phrase "${entry.headword}":`, error);
      stats.errors++;
    }
  }
}

/**
 * Update Chinese-Russian dictionary
 */
async function updateChineseRussian(): Promise<void> {
  const parser = createDslParser();
  const filePath = path.join(__dirname, '../../../../db_bkrs/dabkrs_251013/dabkrs_251013');

  console.log('\n📚 Updating Chinese-Russian dictionary pinyin...');
  console.log(`   File: ${filePath}\n`);

  let batch: DslEntry[] = [];
  const batchSize = 500; // Process 500 entries at a time
  let processed = 0;

  for await (const entry of parser.parseFile(filePath)) {
    batch.push(entry);

    if (batch.length >= batchSize) {
      await updateCharactersBatch(batch);
      batch = [];
      processed += batchSize;

      // Progress update every batch
      const elapsed = (Date.now() - stats.startTime) / 1000;
      const rate = processed / elapsed;
      const eta = (790149 - processed) / rate; // Expected total with pinyin
      
      process.stdout.write(
        `\r  Characters processed: ${processed.toLocaleString()} | ` +
        `Updated: ${stats.charactersUpdated.toLocaleString()} | ` +
        `Added: ${stats.charactersAdded.toLocaleString()} | ` +
        `Rate: ${rate.toFixed(0)} entries/sec | ` +
        `ETA: ${Math.floor(eta / 60)}m ${Math.floor(eta % 60)}s`
      );
    }
  }

  // Process remaining entries
  if (batch.length > 0) {
    await updateCharactersBatch(batch);
    processed += batch.length;
  }

  console.log(`\n✅ Chinese-Russian dictionary updated! (${processed.toLocaleString()} entries processed)\n`);
}

/**
 * Update Russian-Chinese dictionary
 */
async function updateRussianChinese(): Promise<void> {
  const parser = createDslParser();
  const filePath = path.join(__dirname, '../../../../db_bkrs/dabruks_251013/dabruks_251013');

  console.log('📚 Updating Russian-Chinese dictionary pinyin...');
  console.log(`   File: ${filePath}\n`);

  let batch: DslEntry[] = [];
  const batchSize = 500;
  let processed = 0;

  for await (const entry of parser.parseFile(filePath)) {
    batch.push(entry);

    if (batch.length >= batchSize) {
      await updatePhrasesBatch(batch);
      batch = [];
      processed += batchSize;

      const elapsed = (Date.now() - stats.startTime) / 1000;
      const rate = processed / elapsed;
      
      process.stdout.write(
        `\r  Phrases processed: ${processed.toLocaleString()} | ` +
        `Updated: ${stats.phrasesUpdated.toLocaleString()} | ` +
        `Added: ${stats.phrasesAdded.toLocaleString()} | ` +
        `Rate: ${rate.toFixed(0)} entries/sec`
      );
    }
  }

  if (batch.length > 0) {
    await updatePhrasesBatch(batch);
    processed += batch.length;
  }

  console.log(`\n✅ Russian-Chinese dictionary updated! (${processed.toLocaleString()} entries processed)\n`);
}

/**
 * Update examples dictionary
 */
async function updateExamples(): Promise<void> {
  const parser = createDslParser();
  const filePath = path.join(__dirname, '../../../../db_bkrs/examples_251013/examples_251013');

  console.log('📚 Updating examples dictionary pinyin...');
  console.log(`   File: ${filePath}\n`);

  let batch: DslEntry[] = [];
  const batchSize = 500;
  let processed = 0;

  for await (const entry of parser.parseFile(filePath)) {
    batch.push(entry);

    if (batch.length >= batchSize) {
      await updateExamplesBatch(batch);
      batch = [];
      processed += batchSize;

      const elapsed = (Date.now() - stats.startTime) / 1000;
      const rate = processed / elapsed;
      const eta = (125725 - processed) / rate; // Expected total with pinyin
      
      process.stdout.write(
        `\r  Examples processed: ${processed.toLocaleString()} | ` +
        `Updated: ${stats.examplesUpdated.toLocaleString()} | ` +
        `Added: ${stats.examplesAdded.toLocaleString()} | ` +
        `Rate: ${rate.toFixed(0)} entries/sec | ` +
        `ETA: ${Math.floor(eta / 60)}m ${Math.floor(eta % 60)}s`
      );
    }
  }

  if (batch.length > 0) {
    await updateExamplesBatch(batch);
    processed += batch.length;
  }

  console.log(`\n✅ Examples dictionary updated! (${processed.toLocaleString()} entries processed)\n`);
}

/**
 * Print final statistics
 */
function printStats(): void {
  const elapsed = (Date.now() - stats.startTime) / 1000;
  const minutes = Math.floor(elapsed / 60);
  const seconds = Math.floor(elapsed % 60);

  console.log('═══════════════════════════════════════════════════════');
  console.log('                   PINYIN UPDATE COMPLETE              ');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('📊 Characters Statistics:');
  console.log('───────────────────────────────────────────────────────');
  console.log(`  Updated:           ${stats.charactersUpdated.toLocaleString()}`);
  console.log(`  Added:             ${stats.charactersAdded.toLocaleString()}`);
  console.log(`  Skipped:           ${stats.charactersSkipped.toLocaleString()}`);
  console.log(`  Total processed:   ${(stats.charactersUpdated + stats.charactersAdded + stats.charactersSkipped).toLocaleString()}`);
  
  console.log('\n📊 Examples Statistics:');
  console.log('───────────────────────────────────────────────────────');
  console.log(`  Updated:           ${stats.examplesUpdated.toLocaleString()}`);
  console.log(`  Added:             ${stats.examplesAdded.toLocaleString()}`);
  console.log(`  Skipped:           ${stats.examplesSkipped.toLocaleString()}`);
  console.log(`  Total processed:   ${(stats.examplesUpdated + stats.examplesAdded + stats.examplesSkipped).toLocaleString()}`);
  
  console.log('\n📊 Phrases Statistics:');
  console.log('───────────────────────────────────────────────────────');
  console.log(`  Updated:           ${stats.phrasesUpdated.toLocaleString()}`);
  console.log(`  Added:             ${stats.phrasesAdded.toLocaleString()}`);
  console.log(`  Skipped:           ${stats.phrasesSkipped.toLocaleString()}`);
  console.log(`  Total processed:   ${(stats.phrasesUpdated + stats.phrasesAdded + stats.phrasesSkipped).toLocaleString()}`);
  
  console.log('\n📊 Overall Statistics:');
  console.log('───────────────────────────────────────────────────────');
  console.log(`  Errors encountered: ${stats.errors.toLocaleString()}`);
  console.log(`  Time elapsed:        ${minutes}m ${seconds}s`);
  
  const totalUpdated = stats.charactersUpdated + stats.examplesUpdated + stats.phrasesUpdated;
  const totalAdded = stats.charactersAdded + stats.examplesAdded + stats.phrasesAdded;
  console.log(`  Total records with pinyin: ${(totalUpdated + totalAdded).toLocaleString()}`);
  
  console.log('═══════════════════════════════════════════════════════\n');
}

/**
 * Main update function
 */
async function main() {
  try {
    console.log('\n🚀 Starting pinyin data update...\n');

    // Update in order: Chinese-Russian first, then Russian-Chinese, then examples
    await updateChineseRussian();
    await updateRussianChinese();
    await updateExamples();

    printStats();

    console.log('✨ All pinyin data updated successfully!');
    console.log('\n📋 Next steps:');
    console.log('  1. Run validation: ts-node src/scripts/validate-pinyin.ts');
    console.log('  2. Check database statistics');
    console.log('  3. Test search functionality');
  } catch (error) {
    console.error('\n❌ Update failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { updateChineseRussian, updateRussianChinese, updateExamples };
