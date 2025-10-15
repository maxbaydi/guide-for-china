#!/usr/bin/env ts-node

/**
 * Script to validate pinyin data quality after update
 * Usage: ts-node validate-pinyin.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationStats {
  characters: {
    total: number;
    withPinyin: number;
    percentage: number;
  };
  examples: {
    total: number;
    withPinyin: number;
    percentage: number;
  };
  phrases: {
    total: number;
    withPinyin: number;
    percentage: number;
  };
  quality: {
    validPinyin: number;
    invalidPinyin: number;
    emptyPinyin: number;
  };
}

/**
 * Validate pinyin format using regex
 */
function isValidPinyin(pinyin: string): boolean {
  if (!pinyin || pinyin.trim() === '') return false;
  
  // Pinyin should contain only Latin letters, tones, spaces, and numbers
  const pinyinRegex = /^[a-zA-ZüÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜêńňǹ\s0-9\u0300-\u036f]+$/;
  
  // Must not contain Chinese characters or DSL tags
  const hasChinese = /[\u4e00-\u9fff]/.test(pinyin);
  const hasDslTags = /\[.*?\]/.test(pinyin);
  
  return pinyinRegex.test(pinyin) && !hasChinese && !hasDslTags;
}

/**
 * Get database statistics
 */
async function getDatabaseStats(): Promise<ValidationStats> {
  console.log('📊 Analyzing database statistics...\n');

  // Characters statistics
  const charactersTotal = await prisma.character.count();
  const charactersWithPinyin = await prisma.character.count({
    where: { pinyin: { not: null } }
  });

  // Examples statistics
  const examplesTotal = await prisma.example.count();
  const examplesWithPinyin = await prisma.example.count({
    where: { pinyin: { not: null } }
  });

  // Phrases statistics
  const phrasesTotal = await prisma.phrase.count();
  const phrasesWithPinyin = await prisma.phrase.count({
    where: { pinyin: { not: null } }
  });

  return {
    characters: {
      total: charactersTotal,
      withPinyin: charactersWithPinyin,
      percentage: charactersTotal > 0 ? (charactersWithPinyin / charactersTotal) * 100 : 0
    },
    examples: {
      total: examplesTotal,
      withPinyin: examplesWithPinyin,
      percentage: examplesTotal > 0 ? (examplesWithPinyin / examplesTotal) * 100 : 0
    },
    phrases: {
      total: phrasesTotal,
      withPinyin: phrasesWithPinyin,
      percentage: phrasesTotal > 0 ? (phrasesWithPinyin / phrasesTotal) * 100 : 0
    },
    quality: {
      validPinyin: 0,
      invalidPinyin: 0,
      emptyPinyin: 0
    }
  };
}

/**
 * Validate pinyin quality (sample check)
 */
async function validatePinyinQuality(stats: ValidationStats): Promise<void> {
  console.log('🔍 Validating pinyin quality (sample check)...\n');

  // Sample 1000 records from each table for quality check
  const sampleSize = 1000;
  
  // Characters sample
  const characterSamples = await prisma.character.findMany({
    where: { pinyin: { not: null } },
    select: { pinyin: true },
    take: sampleSize
  });

  // Examples sample
  const exampleSamples = await prisma.example.findMany({
    where: { pinyin: { not: null } },
    select: { pinyin: true },
    take: sampleSize
  });

  // Phrases sample
  const phraseSamples = await prisma.phrase.findMany({
    where: { pinyin: { not: null } },
    select: { pinyin: true },
    take: sampleSize
  });

  // Validate samples
  const allSamples = [
    ...characterSamples.map(c => c.pinyin),
    ...exampleSamples.map(e => e.pinyin),
    ...phraseSamples.map(p => p.pinyin)
  ].filter(pinyin => pinyin !== null) as string[];

  for (const pinyin of allSamples) {
    if (!pinyin || pinyin.trim() === '') {
      stats.quality.emptyPinyin++;
    } else if (isValidPinyin(pinyin)) {
      stats.quality.validPinyin++;
    } else {
      stats.quality.invalidPinyin++;
    }
  }

  const totalSamples = allSamples.length;
  if (totalSamples > 0) {
    console.log(`📋 Quality check results (${totalSamples.toLocaleString()} samples):`);
    console.log(`  Valid pinyin:     ${stats.quality.validPinyin.toLocaleString()} (${((stats.quality.validPinyin / totalSamples) * 100).toFixed(1)}%)`);
    console.log(`  Invalid pinyin:   ${stats.quality.invalidPinyin.toLocaleString()} (${((stats.quality.invalidPinyin / totalSamples) * 100).toFixed(1)}%)`);
    console.log(`  Empty pinyin:     ${stats.quality.emptyPinyin.toLocaleString()} (${((stats.quality.emptyPinyin / totalSamples) * 100).toFixed(1)}%)`);
  }
}

/**
 * Compare with expected values
 */
function compareWithExpected(stats: ValidationStats): void {
  console.log('\n📈 Comparison with expected values:');
  console.log('───────────────────────────────────────────────────────');

  // Expected values from original BKRS data
  const expected = {
    characters: { total: 10319591, withPinyin: 790149 },
    examples: { total: 1897637, withPinyin: 125725 },
    phrases: { total: 509065, withPinyin: 0 }
  };

  console.log('Characters:');
  console.log(`  Expected with pinyin: ${expected.characters.withPinyin.toLocaleString()}`);
  console.log(`  Actual with pinyin:   ${stats.characters.withPinyin.toLocaleString()}`);
  console.log(`  Coverage:             ${((stats.characters.withPinyin / expected.characters.withPinyin) * 100).toFixed(1)}%`);

  console.log('\nExamples:');
  console.log(`  Expected with pinyin: ${expected.examples.withPinyin.toLocaleString()}`);
  console.log(`  Actual with pinyin:   ${stats.examples.withPinyin.toLocaleString()}`);
  console.log(`  Coverage:             ${((stats.examples.withPinyin / expected.examples.withPinyin) * 100).toFixed(1)}%`);

  console.log('\nPhrases:');
  console.log(`  Expected with pinyin: ${expected.phrases.withPinyin.toLocaleString()}`);
  console.log(`  Actual with pinyin:   ${stats.phrases.withPinyin.toLocaleString()}`);
  console.log(`  Coverage:             ${expected.phrases.withPinyin > 0 ? ((stats.phrases.withPinyin / expected.phrases.withPinyin) * 100).toFixed(1) : 'N/A'}%`);

  const totalExpected = expected.characters.withPinyin + expected.examples.withPinyin + expected.phrases.withPinyin;
  const totalActual = stats.characters.withPinyin + stats.examples.withPinyin + stats.phrases.withPinyin;
  
  console.log('\nOverall:');
  console.log(`  Expected total:      ${totalExpected.toLocaleString()}`);
  console.log(`  Actual total:        ${totalActual.toLocaleString()}`);
  console.log(`  Overall coverage:     ${((totalActual / totalExpected) * 100).toFixed(1)}%`);
}

/**
 * Print detailed report
 */
function printReport(stats: ValidationStats): void {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('                   VALIDATION REPORT                    ');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('📊 Database Statistics:');
  console.log('───────────────────────────────────────────────────────');
  console.log(`Characters:  ${stats.characters.withPinyin.toLocaleString()} / ${stats.characters.total.toLocaleString()} (${stats.characters.percentage.toFixed(2)}%)`);
  console.log(`Examples:    ${stats.examples.withPinyin.toLocaleString()} / ${stats.examples.total.toLocaleString()} (${stats.examples.percentage.toFixed(2)}%)`);
  console.log(`Phrases:     ${stats.phrases.withPinyin.toLocaleString()} / ${stats.phrases.total.toLocaleString()} (${stats.phrases.percentage.toFixed(2)}%)`);

  const totalWithPinyin = stats.characters.withPinyin + stats.examples.withPinyin + stats.phrases.withPinyin;
  const totalRecords = stats.characters.total + stats.examples.total + stats.phrases.total;
  const overallPercentage = totalRecords > 0 ? (totalWithPinyin / totalRecords) * 100 : 0;

  console.log(`\nTotal:       ${totalWithPinyin.toLocaleString()} / ${totalRecords.toLocaleString()} (${overallPercentage.toFixed(2)}%)`);

  // Quality assessment
  console.log('\n🎯 Quality Assessment:');
  console.log('───────────────────────────────────────────────────────');
  
  if (stats.characters.percentage >= 20) {
    console.log('✅ Characters: Good coverage (≥20%)');
  } else if (stats.characters.percentage >= 10) {
    console.log('⚠️  Characters: Moderate coverage (10-20%)');
  } else {
    console.log('❌ Characters: Low coverage (<10%)');
  }

  if (stats.examples.percentage >= 0.5) {
    console.log('✅ Examples: Good coverage (≥0.5%)');
  } else if (stats.examples.percentage >= 0.1) {
    console.log('⚠️  Examples: Moderate coverage (0.1-0.5%)');
  } else {
    console.log('❌ Examples: Low coverage (<0.1%)');
  }

  if (stats.phrases.percentage >= 0.1) {
    console.log('✅ Phrases: Good coverage (≥0.1%)');
  } else {
    console.log('ℹ️  Phrases: Low coverage (expected for Russian-Chinese)');
  }

  console.log('\n📋 Recommendations:');
  console.log('───────────────────────────────────────────────────────');
  
  if (stats.characters.percentage < 20) {
    console.log('• Consider re-running update-pinyin.ts for characters');
  }
  
  if (stats.examples.percentage < 0.5) {
    console.log('• Consider re-running update-pinyin.ts for examples');
  }
  
  if (stats.quality.invalidPinyin > stats.quality.validPinyin * 0.1) {
    console.log('• Review pinyin validation logic - high invalid rate detected');
  }

  console.log('• Test search functionality to ensure pinyin search works');
  console.log('• Monitor search performance with increased pinyin data');

  console.log('\n═══════════════════════════════════════════════════════\n');
}

/**
 * Main validation function
 */
async function main() {
  try {
    console.log('\n🔍 Starting pinyin data validation...\n');

    const stats = await getDatabaseStats();
    await validatePinyinQuality(stats);
    compareWithExpected(stats);
    printReport(stats);

    console.log('✨ Validation completed successfully!');
  } catch (error) {
    console.error('\n❌ Validation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { getDatabaseStats, validatePinyinQuality, printReport };
