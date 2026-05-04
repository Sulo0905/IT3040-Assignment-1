/**
 * Helper utilities for Chat Sinhala transliteration testing
 * Target: https://www.pixelssuite.com/chat-translator
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
  return 'L'; // 300-450
}

/**
 * Types text into the input textarea
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} text - Text to input
 */
async function inputText(page, text) {
  const inputArea = page.locator('textarea').first();
  await inputArea.clear();
  await page.waitForTimeout(300);
  await inputArea.fill(text);
  await page.waitForTimeout(500);
}

/**
 * Clicks the Transliterate button and waits for result with retry logic
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} text - The input text (needed for re-filling on retry)
 * @param {number} maxRetries - Maximum number of retries on "Failed to fetch"
 * @returns {Promise<string>} - Translated text or error message
 */
async function clickTransliterateWithRetry(page, text, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Click the Transliterate button
    const transliterateBtn = page.locator('button', { hasText: 'Transliterate' }).first();
    await transliterateBtn.click();

    // Wait for processing
    await page.waitForTimeout(4000);

    // Wait for button to stop showing "Transliterating..."
    try {
      await page.waitForFunction(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.textContent.includes('Transliterating')) return false;
        }
        return true;
      }, { timeout: 30000 });
    } catch (e) {
      console.log(`Attempt ${attempt}: Transliteration timed out`);
    }

    await page.waitForTimeout(1000);

    // Check for "Failed to fetch" error
    const pageContent = await page.content();
    if (pageContent.includes('Failed to fetch') && attempt < maxRetries) {
      console.log(`Attempt ${attempt}: "Failed to fetch" - retrying after delay...`);
      // Reload the page to clear the error state
      await page.goto('https://www.pixelssuite.com/chat-translator');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Re-fill the input text
      await inputText(page, text);
      continue;
    }

    // If we got "Failed to fetch" on last attempt, return it as actual output
    if (pageContent.includes('Failed to fetch')) {
      return '[Failed to fetch - API error]';
    }

    break;
  }

  return await getOutputText(page);
}

/**
 * Gets the output text from the output textarea
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<string>}
 */
async function getOutputText(page) {
  try {
    const outputArea = page.locator('textarea').nth(1);
    const outputText = await outputArea.inputValue();

    if (outputText && outputText.trim().length > 0 &&
        !outputText.includes('Transliterated Sinhala will appear here')) {
      return outputText.trim();
    }

    // Fallback: try textContent
    const textContent = await outputArea.textContent();
    if (textContent && textContent.trim().length > 0 &&
        !textContent.includes('Transliterated Sinhala will appear here')) {
      return textContent.trim();
    }

    return '';
  } catch (error) {
    console.error('Could not find output:', error.message);
    return '';
  }
}

/**
 * Full flow: input text, click transliterate with retry, and get the output
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} text - Text to transliterate
 * @returns {Promise<string>} - Translated text
 */
async function transliterate(page, text) {
  await inputText(page, text);
  return await clickTransliterateWithRetry(page, text);
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
  inputText,
  clickTransliterateWithRetry,
  getOutputText,
  transliterate,
  compareTranslation,
  calculateSimilarity
};
