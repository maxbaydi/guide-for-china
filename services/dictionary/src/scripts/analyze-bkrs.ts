#!/usr/bin/env ts-node

/**
 * Script to analyze BKRS dictionary files
 * Usage: ts-node analyze-bkrs.ts <path-to-dsl-file>
 */

import * as path from 'path';
import { createDslParser } from '../utils/dsl-parser';

interface AnalysisResult {
  fileName: string;
  totalEntries: number;
  entriesWithExamples: number;
  entriesWithPinyin: number;
  entriesWithTraditional: number;
  totalDefinitions: number;
  totalExamples: number;
  averageDefinitionsPerEntry: number;
  averageExamplesPerEntry: number;
  dictionaryName?: string;
  indexLanguage?: string;
  contentsLanguage?: string;
  sampleEntries: string[];
}

async function analyzeDslFile(filePath: string): Promise<AnalysisResult> {
  const parser = createDslParser();
  const fileName = path.basename(filePath);
  
  console.log(`\n📚 Analyzing file: ${fileName}`);
  console.log('⏳ Processing...\n');

  let totalEntries = 0;
  let entriesWithExamples = 0;
  let entriesWithPinyin = 0;
  let entriesWithTraditional = 0;
  let totalDefinitions = 0;
  let totalExamples = 0;
  const sampleEntries: string[] = [];

  const startTime = Date.now();

  try {
    for await (const entry of parser.parseFile(filePath)) {
      totalEntries++;

      // Count statistics
      totalDefinitions += entry.definitions.length;
      totalExamples += entry.examples.length;

      if (entry.examples.length > 0) {
        entriesWithExamples++;
      }

      if (entry.pinyin) {
        entriesWithPinyin++;
      }

      if (entry.traditional) {
        entriesWithTraditional++;
      }

      // Collect sample entries (first 10)
      if (sampleEntries.length < 10) {
        sampleEntries.push(entry.headword);
      }

      // Progress indicator
      if (totalEntries % 10000 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = totalEntries / elapsed;
        console.log(`  Processed ${totalEntries.toLocaleString()} entries (${rate.toFixed(0)} entries/sec)`);
      }
    }

    const elapsed = (Date.now() - startTime) / 1000;
    console.log(`\n✅ Analysis complete! (${elapsed.toFixed(2)} seconds)\n`);

    const metadata = parser.getMetadata();

    return {
      fileName,
      totalEntries,
      entriesWithExamples,
      entriesWithPinyin,
      entriesWithTraditional,
      totalDefinitions,
      totalExamples,
      averageDefinitionsPerEntry: totalDefinitions / totalEntries || 0,
      averageExamplesPerEntry: totalExamples / totalEntries || 0,
      dictionaryName: metadata.name,
      indexLanguage: metadata.indexLanguage,
      contentsLanguage: metadata.contentsLanguage,
      sampleEntries,
    };
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    throw error;
  }
}

function printResults(result: AnalysisResult): void {
  console.log('═══════════════════════════════════════════════════════');
  console.log('                   ANALYSIS RESULTS                     ');
  console.log('═══════════════════════════════════════════════════════\n');

  if (result.dictionaryName) {
    console.log(`📖 Dictionary Name: ${result.dictionaryName}`);
  }
  if (result.indexLanguage) {
    console.log(`🔤 Index Language: ${result.indexLanguage}`);
  }
  if (result.contentsLanguage) {
    console.log(`🈲 Contents Language: ${result.contentsLanguage}`);
  }

  console.log('\n📊 Statistics:');
  console.log('─────────────────────────────────────────────────────── ');
  console.log(`  Total Entries:              ${result.totalEntries.toLocaleString()}`);
  console.log(`  Total Definitions:          ${result.totalDefinitions.toLocaleString()}`);
  console.log(`  Total Examples:             ${result.totalExamples.toLocaleString()}`);
  console.log(`  Avg Definitions/Entry:      ${result.averageDefinitionsPerEntry.toFixed(2)}`);
  console.log(`  Avg Examples/Entry:         ${result.averageExamplesPerEntry.toFixed(2)}`);
  
  console.log('\n📈 Coverage:');
  console.log('───────────────────────────────────────────────────────');
  console.log(`  Entries with Examples:      ${result.entriesWithExamples.toLocaleString()} (${((result.entriesWithExamples / result.totalEntries) * 100).toFixed(1)}%)`);
  console.log(`  Entries with Pinyin:        ${result.entriesWithPinyin.toLocaleString()} (${((result.entriesWithPinyin / result.totalEntries) * 100).toFixed(1)}%)`);
  console.log(`  Entries with Traditional:   ${result.entriesWithTraditional.toLocaleString()} (${((result.entriesWithTraditional / result.totalEntries) * 100).toFixed(1)}%)`);

  if (result.sampleEntries.length > 0) {
    console.log('\n📝 Sample Entries (first 10):');
    console.log('───────────────────────────────────────────────────────');
    result.sampleEntries.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry}`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: ts-node analyze-bkrs.ts <path-to-dsl-file>');
    console.error('\nExample:');
    console.error('  ts-node analyze-bkrs.ts ../../db_bkrs/dabkrs_251013/dabkrs_251013');
    process.exit(1);
  }

  const filePath = args[0];

  try {
    const result = await analyzeDslFile(filePath);
    printResults(result);

    // Save results to JSON for later use
    const resultPath = path.join(path.dirname(filePath), `analysis-${path.basename(filePath)}.json`);
    const fs = require('fs');
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    console.log(`💾 Results saved to: ${resultPath}\n`);

  } catch (error) {
    console.error('❌ Failed to analyze file:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { analyzeDslFile, AnalysisResult };

