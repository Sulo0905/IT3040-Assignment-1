# Singlish to Sinhala Translator - Automated Testing

## IT3040 Assignment 1

This project contains automated tests for the Singlish to Sinhala translator at [SwiftTranslator](https://www.swifttranslator.com/) using Playwright.

---

## 📋 Test Coverage

**Total Test Cases: 35**
- ✅ Positive Functional Tests: 24
- ❌ Negative Functional Tests: 10  
- 🎨 UI Tests: 1

### Coverage Areas
- Sentence structures (simple, compound, complex)
- Sentence types (questions, commands)
- Grammar (tenses, pronouns, singular/plural)
- Daily language (greetings, requests, slang)
- Input lengths (Short ≤30, Medium 31-299, Long ≥300 chars)
- Edge cases (spaces, punctuation, mixed language, etc.)

---

## 🛠️ Prerequisites

- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher

### Check your versions:
```bash
node --version
npm --version
```

---

## 📦 Installation

1. **Clone or download this repository**

2. **Navigate to the project directory:**
```bash
cd d:\assignments\sinhala
```

3. **Install dependencies:**
```bash
npm install
```

4. **Install Playwright browsers:**
```bash
npx playwright install chromium
```

---

## 🚀 Running Tests

### Run all tests:
```bash
npm test
```

### Run tests in headed mode (see browser):
```bash
npm run test:headed
```

### Run tests in debug mode:
```bash
npm run test:debug
```

### View test report:
```bash
npm run report
```

---

## 📁 Project Structure

```
sinhala/
├── tests/
│   ├── translator.spec.js      # Main test suite (35 tests)
│   ├── test-data.json           # Test case data
│   └── utils/
│       └── helpers.js           # Utility functions
├── playwright.config.js         # Playwright configuration
├── package.json                 # Project dependencies
├── TestCases.csv               # Test documentation (Excel-ready)
├── README.md                    # This file
└── .gitignore                   # Git ignore rules
```

---

## 📊 Test Results

After running tests:
- HTML report: `playwright-report/index.html`
- Screenshots (on failure): `test-results/`
- Console output shows detailed results for each test

---

## 📝 Test Case Documentation

The `TestCases.csv` file contains:
- Test Case ID
- Test Case Name
- Input (Singlish)
- Expected Output (Sinhala)
- Input Length Type (S/M/L)
- Coverage details
- Actual Output (filled after test run)
- Status (Pass/Fail)
- Accuracy justification

**To update the CSV with actual results:**
1. Run the tests: `npm test`
2. Check console output for actual outputs
3. Open `TestCases.csv` in Excel
4. Fill in "Actual Output" and "Status" columns
5. Add accuracy justification notes
6. Save as `.xlsx` format

---

## 🔧 Customization

### Adjusting Timeouts
Edit `playwright.config.js`:
```javascript
timeout: 60000,  // Overall test timeout
actionTimeout: 10000,  // Individual action timeout
```

### Modifying Test Data
Edit `tests/test-data.json` to add/modify test cases.

### Adjusting Selectors
If website structure changes, update selectors in `tests/utils/helpers.js`:
```javascript
const inputSelector = 'textarea[placeholder*="Singlish"]';
const outputSelector = 'textarea[placeholder*="Sinhala"]';
```

---

## 🐛 Troubleshooting

### Tests failing to find elements?
- The website structure may have changed
- Check browser in headed mode: `npm run test:headed`
- Update selectors in `helpers.js`

### Timeouts occurring?
- Increase timeout in `playwright.config.js`
- Check internet connection
- Verify website is accessible

### Installation issues?
- Ensure Node.js version is 16+
- Try: `npm cache clean --force`
- Reinstall: `rm -rf node_modules && npm install`

---

## 👨‍💻 Author

IT3040 Assignment 1 - Software Testing

---

## 📄 License

This project is for educational purposes only.
