#!/usr/bin/env ts-node

/**
 * Script to import only examples from BKRS examples dictionary
 * Usage: ts-node import-examples-only.ts
 */

import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import { createDslParser, DslEntry } from '../utils/dsl-parser';

const prisma = new PrismaClient();

interface ImportStats {
  totalExamples: number;
  errors: number;
  startTime: number;
}

const stats: ImportStats = {
  totalExamples: 0,
  errors: 0,
  startTime: Date.now(),
};

/**
 * Process a batch of examples with optimized queries
 */
async function processExamplesBatch(entries: DslEntry[]): Promise<void> {
  // Extract all unique individual characters from phrases
  const allChars = new Set<string>();
  
  for (const entry of entries) {
    if (!entry.simplified) continue;
    
    // Split phrase into individual characters
    const chars = entry.simplified.split('').filter(char => {
      // Only Chinese characters (Unicode range)
      return /[\u4e00-\u9fff]/.test(char);
    });
    
    chars.forEach(char => allChars.add(char));
  }

  if (allChars.size === 0) return;

  // Batch fetch all characters at once
  const characters = await prisma.character.findMany({
    where: {
      simplified: { in: Array.from(allChars) }
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
      if (!entry.simplified) continue;

      // Get translation from content or use headword
      const russian = entry.content || entry.headword;
      
      // Split phrase into individual characters
      const chars = entry.simplified.split('').filter(char => {
        return /[\u4e00-\u9fff]/.test(char);
      });

      // Create example for each character in the phrase
      for (const char of chars) {
        const characterId = charMap.get(char);
        if (!characterId) continue;

        examplesToInsert.push({
          characterId,
          chinese: entry.headword, // Full phrase as example
          russian: russian,
          pinyin: entry.pinyin || null,
        });
      }
    } catch (error) {
      stats.errors++;
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
 * Import examples dictionary with optimized batch processing
 */
async function importExamples(): Promise<void> {
  const parser = createDslParser();
  const filePath = path.join(__dirname, '../../../../db_bkrs/examples_251013/examples_251013');

  console.log('📚 Importing examples dictionary...');
  console.log(`   File: ${filePath}\n`);

  let processed = 0;
  const batchSize = 1000; // Batch size for better performance
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
 * Print final statistics
 */
function printStats(): void {
  const elapsed = (Date.now() - stats.startTime) / 1000;
  const rate = stats.totalExamples / elapsed;

  console.log('\n📊 Import Statistics:');
  console.log('===================');
  console.log(`Total Examples: ${stats.totalExamples.toLocaleString()}`);
  console.log(`Errors: ${stats.errors.toLocaleString()}`);
  console.log(`Time: ${elapsed.toFixed(1)} seconds`);
  console.log(`Rate: ${rate.toFixed(0)} examples/sec\n`);
}

/**
 * Main import function
 */
async function main() {
  try {
    console.log('\n🚀 Starting BKRS examples import...\n');

    await importExamples();
    printStats();

    console.log('✨ Examples import completed successfully!');
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
