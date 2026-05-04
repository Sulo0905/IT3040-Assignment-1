const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

function generateExcel() {
  const resultsFile = path.join(__dirname, 'test-output-results.json');
  
  if (!fs.existsSync(resultsFile)) {
    console.error('Results JSON file not found. Have the tests completed?');
    return;
  }
  
  const rawData = fs.readFileSync(resultsFile, 'utf8');
  const results = JSON.parse(rawData);
  
  // Format data for Excel according to Appendix 2 format
  const excelData = results.map(r => ({
    'TC ID': r.id,
    'length type': r.lengthType,
    'Input': r.input,
    'Expected output': r.expected,
    'Actual output': r.actual,
    'Status': r.status,
    'Singlish input types covered': r.inputTypes.join(', '),
    'Evidence or rationale for the input type covered': r.rationale
  }));
  
  // Create a new workbook and add the worksheet
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(excelData);
  
  // Set column widths
  ws['!cols'] = [
    {wch: 15}, // TC ID
    {wch: 12}, // length type
    {wch: 40}, // Input
    {wch: 40}, // Expected output
    {wch: 40}, // Actual output
    {wch: 10}, // Status
    {wch: 40}, // Singlish input types covered
    {wch: 60}  // Evidence or rationale
  ];
  
  xlsx.utils.book_append_sheet(wb, ws, 'Test Cases');
  
  // Write to file
  const outputPath = path.join(__dirname, 'Assignment 1 - Test cases.xlsx');
  xlsx.writeFile(wb, outputPath);
  
  console.log(`Successfully generated Excel file at: ${outputPath}`);
}

generateExcel();
