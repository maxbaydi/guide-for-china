#!/usr/bin/env ts-node

/**
 * Script to import BKRS dictionary data into PostgreSQL
 * Usage: ts-node import-bkrs.ts
 */

import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import { createDslParser, DslEntry } from '../utils/dsl-parser';

const prisma = new PrismaClient();

interface ImportStats {
  totalCharacters: number;
  totalDefinitions: number;
  totalExamples: number;
  totalPhrases: number;
  errors: number;
  startTime: number;
}

const stats: ImportStats = {
  totalCharacters: 0,
  totalDefinitions: 0,
  totalExamples: 0,
  totalPhrases: 0,
  errors: 0,
  startTime: Date.now(),
};

/**
 * Import a batch of characters with their definitions and examples
 */
async function importCharacterBatch(entries: DslEntry[]): Promise<void> {
  for (const entry of entries) {
    try {
      // Skip entries without Chinese characters
      if (!entry.simplified || entry.simplified.trim() === '') {
        continue;
      }

      // Check if character already exists
      const existing = await prisma.character.findUnique({
        where: { simplified: entry.simplified },
      });

      let characterId: string;

      if (existing) {
        characterId = existing.id;
      } else {
        // Create new character
        const character = await prisma.character.create({
          data: {
            simplified: entry.simplified,
            traditional: entry.traditional || null,
            pinyin: entry.pinyin || null,
          },
        });
        characterId = character.id;
        stats.totalCharacters++;
      }

      // Import definitions
      if (entry.definitions.length > 0) {
        await prisma.definition.createMany({
          data: entry.definitions.map((def) => ({
            characterId,
            translation: def.translation,
            partOfSpeech: def.partOfSpeech || null,
            context: def.context || null,
            order: def.order,
          })),
          skipDuplicates: true,
        });
        stats.totalDefinitions += entry.definitions.length;
      }

      // Import examples
      if (entry.examples.length > 0) {
        await prisma.example.createMany({
          data: entry.examples.map((ex) => ({
            characterId,
            chinese: ex.chinese,
            pinyin: ex.pinyin || null,
            russian: ex.russian,
          })),
          skipDuplicates: true,
        });
        stats.totalExamples += entry.examples.length;
      }
    } catch (error) {
      console.error(`Error importing entry "${entry.headword}":`, error);
      stats.errors++;
    }
  }
}

/**
 * Import Russian-Chinese phrases
 */
async function importPhraseBatch(entries: DslEntry[]): Promise<void> {
  for (const entry of entries) {
    try {
      // Extract Chinese from content
      const chineseMatches = entry.content.match(/[\u4e00-\u9fff]+/g);
      if (!chineseMatches || chineseMatches.length === 0) {
        continue;
      }

      const chinese = chineseMatches.join('');
      const russian = entry.headword;

      // Skip if already exists
      const existing = await prisma.phrase.findFirst({
        where: {
          AND: [
            { russian: russian },
            { chinese: chinese },
          ],
        },
      });

      if (!existing) {
        await prisma.phrase.create({
          data: {
            russian,
            chinese,
            pinyin: entry.pinyin || null,
          },
        });
        stats.totalPhrases++;
      }
    } catch (error) {
      console.error(`Error importing phrase "${entry.headword}":`, error);
      stats.errors++;
    }
  }
}

/**
 * Import Chinese-Russian dictionary
 */
async function importChineseRussian(): Promise<void> {
  const parser = createDslParser();
  const filePath = path.join(__dirname, '../../../../db_bkrs/dabkrs_251013/dabkrs_251013');

  console.log('\n📚 Importing Chinese-Russian dictionary...');
  console.log(`   File: ${filePath}\n`);

  let batch: DslEntry[] = [];
  const batchSize = 100; // Process 100 entries at a time

  for await (const entry of parser.parseFile(filePath)) {
    batch.push(entry);

    if (batch.length >= batchSize) {
      await importCharacterBatch(batch);
      batch = [];

      // Progress update every batch
      const elapsed = (Date.now() - stats.startTime) / 1000;
      const rate = stats.totalCharacters / elapsed;
      process.stdout.write(
        `\r  Characters: ${stats.totalCharacters.toLocaleString()} | ` +
        `Definitions: ${stats.totalDefinitions.toLocaleString()} | ` +
        `Examples: ${stats.totalExamples.toLocaleString()} | ` +
        `Rate: ${rate.toFixed(0)} chars/sec`
      );
    }
  }

  // Process remaining entries
  if (batch.length > 0) {
    await importCharacterBatch(batch);
  }

  console.log('\n✅ Chinese-Russian dictionary imported!\n');
}

/**
 * Import Russian-Chinese dictionary
 */
async function importRussianChinese(): Promise<void> {
  const parser = createDslParser();
  const filePath = path.join(__dirname, '../../../../db_bkrs/dabruks_251013/dabruks_251013');

  console.log('📚 Importing Russian-Chinese dictionary...');
  console.log(`   File: ${filePath}\n`);

  let batch: DslEntry[] = [];
  const batchSize = 100;

  for await (const entry of parser.parseFile(filePath)) {
    batch.push(entry);

    if (batch.length >= batchSize) {
      await importPhraseBatch(batch);
      batch = [];

      const elapsed = (Date.now() - stats.startTime) / 1000;
      const rate = stats.totalPhrases / elapsed;
      process.stdout.write(
        `\r  Phrases: ${stats.totalPhrases.toLocaleString()} | ` +
        `Rate: ${rate.toFixed(0)} phrases/sec`
      );
    }
  }

  if (batch.length > 0) {
    await importPhraseBatch(batch);
  }

  console.log('\n✅ Russian-Chinese dictionary imported!\n');
}

/**
 * Import examples dictionary with optimized batch processing
 */
async function importExamples(): Promise<void> {
  const parser = createDslParser();
  const filePath = path.join(__dirname, '../../../../db_bkrs/examples_251013/examples_251013');

  console.log('📚 Importing examples dictionary...');
  console.log(`   File: ${filePath}\n`);

  let processed = 0;
  const batchSize = 1000; // Increased batch size for better performance
  let batch: DslEntry[] = [];

  for await (const entry of parser.parseFile(filePath)) {
    batch.push(entry);

    if (batch.length >= batchSize) {
      await processExamplesBatch(batch);
      processed += batch.length;
      batch = [];
      
      const elapsed = (Date.now() - stats.startTime) / 1000;
      const rate = processed / elapsed;
      process.stdout.write(`\r  Examples processed: ${processed.toLocaleString()} | Rate: ${rate.toFixed(0)} entries/sec`);
    }
  }

  // Process remaining entries
  if (batch.length > 0) {
    await processExamplesBatch(batch);
    processed += batch.length;
  }

  console.log(`\n✅ Examples dictionary imported! (${processed.toLocaleString()} examples processed)\n`);
}

/**
 * Process a batch of examples with optimized queries
 */
async function processExamplesBatch(entries: DslEntry[]): Promise<void> {
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

  // Prepare examples for batch insert
  const examplesToInsert = [];

  for (const entry of entries) {
    try {
      if (!entry.simplified || !entry.definitions.length) continue;

      const characterId = charMap.get(entry.simplified);
      if (!characterId) continue;

      // Use first definition as example
      const def = entry.definitions[0];
      examplesToInsert.push({
        characterId,
        chinese: entry.headword,
        russian: def.translation,
        pinyin: entry.pinyin || null,
      });
    } catch (error) {
      // Skip errors silently
    }
  }

  // Batch insert all examples
  if (examplesToInsert.length > 0) {
    await prisma.example.createMany({
      data: examplesToInsert,
      skipDuplicates: true,
    });
    stats.totalExamples += examplesToInsert.length;
  }
}

/**
 * Print final statistics
 */
function printStats(): void {
  const elapsed = (Date.now() - stats.startTime) / 1000;
  const minutes = Math.floor(elapsed / 60);
  const seconds = Math.floor(elapsed % 60);

  console.log('═══════════════════════════════════════════════════════');
  console.log('                   IMPORT COMPLETE                      ');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('📊 Statistics:');
  console.log('───────────────────────────────────────────────────────');
  console.log(`  Characters imported:    ${stats.totalCharacters.toLocaleString()}`);
  console.log(`  Definitions imported:   ${stats.totalDefinitions.toLocaleString()}`);
  console.log(`  Examples imported:      ${stats.totalExamples.toLocaleString()}`);
  console.log(`  Phrases imported:       ${stats.totalPhrases.toLocaleString()}`);
  console.log(`  Errors encountered:     ${stats.errors.toLocaleString()}`);
  console.log(`  Time elapsed:           ${minutes}m ${seconds}s`);
  console.log('═══════════════════════════════════════════════════════\n');
}

/**
 * Main import function
 */
async function main() {
  try {
    console.log('\n🚀 Starting BKRS data import...\n');

    // Import in order: Chinese-Russian first, then Russian-Chinese, then examples
    await importChineseRussian();
    await importRussianChinese();
    await importExamples();

    printStats();

    console.log('✨ All data imported successfully!');
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { importChineseRussian, importRussianChinese, importExamples };

