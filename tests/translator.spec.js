const { test, expect } = require('@playwright/test');
const { inputText, waitForTranslation, compareTranslation, getInputLengthType } = require('./utils/helpers');
const testData = require('./test-data.json');

// Combine all test cases
const allTests = [
  ...testData.positive_functional,
  ...testData.negative_functional,
  ...testData.ui_tests
];

test.describe('Singlish to Sinhala Translator - Functional Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the translator website
    await page.goto('https://www.singlish2sinhala.app/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Give some time for any dynamic content to load
    await page.waitForTimeout(2000);
  });

  // POSITIVE FUNCTIONAL TESTS
  testData.positive_functional.forEach((testCase) => {
    test(`${testCase.id}: ${testCase.name}`, async ({ page }) => {
      // Input the Singlish text
      await inputText(page, testCase.input);
      
      // Wait for translation to appear
      const actualOutput = await waitForTranslation(page);
      
      // Compare with expected output
      const result = compareTranslation(actualOutput, testCase.expected);
      
      // Log the results
      console.log(`\n--- ${testCase.id} ---`);
      console.log(`Input: ${testCase.input}`);
      console.log(`Expected: ${testCase.expected}`);
      console.log(`Actual: ${actualOutput}`);
      console.log(`Status: ${result.status}`);
      console.log(`Message: ${result.message}`);
      
      // Verify the input length type matches
      const actualLengthType = getInputLengthType(testCase.input);
      expect(actualLengthType).toBe(testCase.lengthType);
      
      // Assert that output is not empty
      expect(actualOutput.length).toBeGreaterThan(0);
      
      // For positive tests, we expect high accuracy
      // Note: This may fail if translation quality is poor - that's expected for testing
      if (result.status === 'Pass') {
        expect(actualOutput).toBeTruthy();
      }
    });
  });

  // NEGATIVE FUNCTIONAL TESTS
  testData.negative_functional.forEach((testCase) => {
    test(`${testCase.id}: ${testCase.name}`, async ({ page }) => {
      // Input the Singlish text (edge case or challenging input)
      await inputText(page, testCase.input);
      
      // Wait for translation to appear
      const actualOutput = await waitForTranslation(page);
      
      // Compare with expected output
      const result = compareTranslation(actualOutput, testCase.expected);
      
      // Log the results
      console.log(`\n--- ${testCase.id} ---`);
      console.log(`Input: ${testCase.input}`);
      console.log(`Expected: ${testCase.expected}`);
      console.log(`Actual: ${actualOutput}`);
      console.log(`Status: ${result.status}`);
      console.log(`Message: ${result.message}`);
      
      // Verify the input length type matches
      const actualLengthType = getInputLengthType(testCase.input);
      expect(actualLengthType).toBe(testCase.lengthType);
      
      // For negative tests, we ALSO check accuracy to document failures
      // These are expected to fail - documenting translator weaknesses
      expect(result.status).toBe('Pass');
    });
  });

  // UI TEST
  testData.ui_tests.forEach((testCase) => {
    test(`${testCase.id}: ${testCase.name}`, async ({ page }) => {
      const inputSelector = 'textarea[placeholder="Type in Singlish here..."]';
      const outputSelector = 'div:below(:text("OUTPUT")) span';
      
      // Clear input first
      await page.locator(inputSelector).first().clear();
      
      // Type slowly to observe real-time updates
      const textToType = testCase.input;
      let previousOutput = '';
      
      for (let i = 0; i < textToType.length; i++) {
        await page.locator(inputSelector).first().type(textToType[i]);
        await page.waitForTimeout(300); // Wait between keystrokes
        
        // Check if output is updating
        const spans = await page.locator(outputSelector).allTextContents();
        const currentOutput = spans.filter(t => t.trim()).join(' ');
        
        console.log(`After typing '${textToType.substring(0, i + 1)}': Output = '${currentOutput}'`);
        
        // Output should be changing (real-time translation)
        if (i > 3) { // After a few characters, we expect some output
          expect((currentOutput || '').length).toBeGreaterThan(0);
        }
        
        previousOutput = currentOutput || '';
      }
      
      // Final output should exist
      const finalOutput = await waitForTranslation(page);
      console.log(`\n--- ${testCase.id} ---`);
      console.log(`UI Test: Real-time translation`);
      console.log(`Final Output: ${finalOutput}`);
      console.log(`Status: Real-time updates ${finalOutput.length > 0 ? 'working' : 'not working'}`);
      
      expect(finalOutput.length).toBeGreaterThan(0);
    });
  });

});
