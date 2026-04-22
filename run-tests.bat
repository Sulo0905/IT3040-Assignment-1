@echo off
echo ========================================
echo IT3040 Assignment 1 - Test Runner
echo ========================================
echo.
echo This will run all 35 tests and show results.
echo Copy the "Actual" outputs from console to fill TestCases.csv
echo.
pause
echo.
echo Running tests...
npm test
echo.
echo ========================================
echo Tests complete!
echo.
echo Next steps:
echo 1. Open TestCases.csv in Excel
echo 2. Fill "Actual Output" column from console above
echo 3. Fill "Status" column (Pass/Fail)
echo 4. Fill "Accuracy Justification" column
echo 5. Save as TestCases.xlsx
echo ========================================
pause
