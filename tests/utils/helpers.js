/**
 * Helper utilities for Singlish to Sinhala translator testing
 */

/**
 * Determines the input length type based on character count
 * @param {string} text - Input text
 * @returns {string} - 'S', 'M', or 'L'
 */
function getInputLengthType(text) {
  const length = text.length;
  if (length <= 30) return 'S';
  if (length >= 31 && length <= 299) return 'M';
  return 'L';
}

/**
 * Waits for translation output to appear and stabilize
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} timeout - Maximum wait time in milliseconds
 * @returns {Promise<string>} - Translated text
 */
async function waitForTranslation(page, timeout = 8000) {
  // Wait for the "Transliterating..." loading state to disappear
  await page.waitForTimeout(3000);
  
  // The output area contains spans with individual translated words
  // We need to collect all span texts from the OUTPUT section
  const outputSelector = 'div:has(> p:text("OUTPUT")) >> div';
  
  try {
    // Wait for output content to appear
    await page.waitForTimeout(2000);
    
    // Try to get all span elements in the output area
    // The output section has spans for each translated word
    const outputArea = page.locator('div').filter({ hasText: /^OUTPUT/ }).first();
    
    // Get all text content from the output div (after the OUTPUT label)
    const allSpans = await page.locator('div:below(:text("OUTPUT")) span').allTextContents();
    
    if (allSpans.length > 0) {
      // Filter out non-Sinhala content and combine
      const sinhalaOutput = allSpans
        .filter(text => text.trim().length > 0)
        .filter(text => !text.includes('OUTPUT') && !text.includes('Copy') && !text.includes('chars'))
        .join(' ')
        .trim();
      
      if (sinhalaOutput.length > 0) {
        return sinhalaOutput;
      }
    }
    
    // Fallback: try getting all text from the output container
    const outputContainer = page.locator('div').filter({ hasText: 'Sinhala script appears here' });
    if (await outputContainer.count() > 0) {
      return '';
    }
    
    // Another fallback: get text from any element after OUTPUT label
    const outputText = await page.locator('div:has(p:text("OUTPUT"))').first().textContent();
    if (outputText) {
      // Remove "OUTPUT", "Copy", character counts etc.
      const cleaned = outputText
        .replace('OUTPUT', '')
        .replace(/Copy/g, '')
        .replace(/\d+ chars/g, '')
        .replace(/Sinhala script appears here\.\.\./g, '')
        .trim();
      return cleaned;
    }
    
    return '';
  } catch (error) {
    console.error('Could not find output:', error.message);
    return '';
  }
}

/**
 * Types text into the input field
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} text - Text to input
 */
async function inputText(page, text) {
  // The input textarea on singlish2sinhala.app
  const inputSelector = 'textarea[placeholder="Type in Singlish here..."]';
  
  await page.locator(inputSelector).first().clear();
  await page.waitForTimeout(500);
  
  // Type the text
  await page.locator(inputSelector).first().fill(text);
}

/**
 * Compares actual output with expected output
 * @param {string} actual - Actual translation output
 * @param {string} expected - Expected translation
 * @returns {Object} - Result with status and message
 */
function compareTranslation(actual, expected) {
  const normalizedActual = actual.trim();
  const normalizedExpected = expected.trim();
  
  if (normalizedActual === normalizedExpected) {
    return {
      status: 'Pass',
      message: 'Translation matches expected output exactly'
    };
  }
  
  // Calculate similarity (simple character-based)
  const similarity = calculateSimilarity(normalizedActual, normalizedExpected);
  
  if (similarity >= 0.9) {
    return {
      status: 'Pass',
      message: `Translation is ${(similarity * 100).toFixed(1)}% similar (minor variations acceptable)`
    };
  }
  
  return {
    status: 'Fail',
    message: `Translation mismatch. Similarity: ${(similarity * 100).toFixed(1)}%`
  };
}

/**
 * Calculates simple similarity ratio between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity ratio (0-1)
 */
function calculateSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const maxLen = Math.max(len1, len2);
  
  if (maxLen === 0) return 1.0;
  
  let matches = 0;
  const minLen = Math.min(len1, len2);
  
  for (let i = 0; i < minLen; i++) {
    if (str1[i] === str2[i]) matches++;
  }
  
  return matches / maxLen;
}

module.exports = {
  getInputLengthType,
  waitForTranslation,
  inputText,
  compareTranslation,
  calculateSimilarity
};
