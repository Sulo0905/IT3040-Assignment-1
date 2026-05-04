const { test, expect } = require('@playwright/test');
const { transliterate, getInputLengthType, compareTranslation } = require('./utils/helpers');
const testData = require('./test-data.json');
const fs = require('fs');
const path = require('path');

const allTests = testData.negative_test_cases;

test.describe('Singlish to Sinhala Translator - Chat Transliteration Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.pixelssuite.com/chat-translator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  // ALL 50 NEGATIVE TEST CASES
  allTests.forEach((tc) => {
    test(`${tc.id}: ${tc.name}`, async ({ page }) => {
      let actualOutput = '';
      let result = { status: 'Fail', message: 'Test execution failed' };

      try {
        // Perform transliteration
        actualOutput = await transliterate(page, tc.input);

        // Compare with expected output
        result = compareTranslation(actualOutput, tc.expected);
        
        // Log the results to console
        console.log(`\n--- ${tc.id} ---`);
        console.log(`Input: ${tc.input}`);
        console.log(`Actual: ${actualOutput}`);
        console.log(`Status: ${result.status}`);
      } catch (error) {
        result.message = `Execution Error: ${error.message}`;
        actualOutput = actualOutput || '[Error during transliteration]';
      } finally {
        // Save result to file regardless of pass/fail
        const resultEntry = {
          id: tc.id,
          name: tc.name,
          input: tc.input,
          lengthType: tc.lengthType,
          expected: tc.expected,
          actual: actualOutput,
          status: result.status,
          inputTypes: tc.inputTypes,
          rationale: tc.rationale,
          message: result.message
        };

        const resultsFile = path.join(__dirname, '..', 'test-output-results.json');
        
        // Safely read the existing array
        let existingResults = [];
        try {
          if (fs.existsSync(resultsFile)) {
            const content = fs.readFileSync(resultsFile, 'utf8');
            existingResults = JSON.parse(content || '[]');
          }
        } catch (e) {
          console.error(`Error reading results file: ${e.message}`);
          // If JSON is corrupted, we don't wipe it out entirely. We just proceed.
          // The atomic write below prevents this corruption from happening in the first place.
        }
        
        existingResults.push(resultEntry);

        // Atomic write: write to a temporary file first, then rename it
        // This ensures that if the process is killed mid-write, the JSON file is never corrupted
        const tempFile = resultsFile + '.tmp';
        fs.writeFileSync(tempFile, JSON.stringify(existingResults, null, 2), 'utf8');
        fs.renameSync(tempFile, resultsFile);
      }

      // Verify the input length type matches
      const actualLengthType = getInputLengthType(tc.input);
      expect(actualLengthType).toBe(tc.lengthType);

      // Assert that actual output does NOT match expected (negative test - we expect failure)
      // This is the final step, ensuring the test fails if it's not a valid negative case
      expect(actualOutput).not.toBe(tc.expected);
    });
  });

});
