/**
 * Excel to CSV Node Executable
 *
 * Converts Excel files (.xlsx, .xls) to CSV format.
 */

import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

// Metadata for this node executable
export const metadata = {
  name: 'Excel to CSV',
  description: 'Converts Excel files (.xlsx, .xls) to CSV format',
  category: 'File Conversion',
  icon: 'FileExcelOutlined',
  settings: [
    {
      key: 'inputFile',
      label: 'Input Excel File Path',
      type: 'string',
      required: true,
      description: 'Path to the Excel file to convert'
    },
    {
      key: 'outputFile',
      label: 'Output CSV File Path',
      type: 'string',
      required: false,
      description: 'Path for the output CSV file (optional, defaults to same name with .csv extension)'
    },
    {
      key: 'sheetName',
      label: 'Sheet Name',
      type: 'string',
      required: false,
      description: 'Name of the sheet to convert (optional, defaults to first sheet)'
    },
    {
      key: 'delimiter',
      label: 'Delimiter',
      type: 'string',
      required: false,
      default: ',',
      description: 'CSV delimiter character (default: comma)'
    }
  ]
};

/**
 * Execute the Excel to CSV conversion
 * @param {Object} input - Input data from the previous node (if any)
 * @param {Object} settings - Node settings
 * @returns {Promise<Object>} - Execution result
 */
export const execute = async (input, settings) => {
  try {
    // Get file path from settings or input
    const inputFile = settings.inputFile || input?.filePath;

    if (!inputFile) {
      return {
        success: false,
        error: 'No input file specified. Please provide an Excel file path.',
        output: null
      };
    }

    // Validate file exists
    if (!fs.existsSync(inputFile)) {
      return {
        success: false,
        error: `File not found: ${inputFile}`,
        output: null
      };
    }

    // Validate file extension
    const ext = path.extname(inputFile).toLowerCase();
    if (!['.xlsx', '.xls'].includes(ext)) {
      return {
        success: false,
        error: `Invalid file type: ${ext}. Expected .xlsx or .xls`,
        output: null
      };
    }

    // Read the Excel file
    const workbook = XLSX.readFile(inputFile);

    // Get the sheet
    const sheetName = settings.sheetName || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      return {
        success: false,
        error: `Sheet not found: ${sheetName}. Available sheets: ${workbook.SheetNames.join(', ')}`,
        output: null
      };
    }

    // Convert to CSV
    const delimiter = settings.delimiter || ',';
    const csvContent = XLSX.utils.sheet_to_csv(worksheet, { FS: delimiter });

    // Determine output file path
    const outputFile = settings.outputFile ||
      inputFile.replace(ext, '.csv');

    // Write CSV file
    fs.writeFileSync(outputFile, csvContent, 'utf-8');

    // Get some stats about the conversion
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const rowCount = range.e.r - range.s.r + 1;
    const colCount = range.e.c - range.s.c + 1;

    return {
      success: true,
      error: null,
      output: {
        filePath: outputFile,
        originalFile: inputFile,
        sheetName: sheetName,
        rowCount: rowCount,
        columnCount: colCount,
        message: `Successfully converted ${path.basename(inputFile)} to CSV`,
        csvPreview: csvContent.split('\n').slice(0, 5).join('\n') // First 5 rows preview
      }
    };

  } catch (error) {
    return {
      success: false,
      error: `Conversion failed: ${error.message}`,
      output: null
    };
  }
};

export default {
  metadata,
  execute
};
