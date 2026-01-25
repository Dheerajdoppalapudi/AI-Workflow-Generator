/**
 * Node Executables Registry
 *
 * This module exports all pre-defined node executables (common agents).
 * Each executable must implement the execute(input, settings) function.
 */

import excelToCsv from './excelToCsv.js';

// Registry of all node executables mapped by their identifier
const nodeExecutables = {
  'excel-to-csv': excelToCsv,
  // Add more node executables here as they are created
  // 'csv-to-json': csvToJson,
  // 'send-email': sendEmail,
  // etc.
};

/**
 * Get a node executable by its identifier
 * @param {string} identifier - The node executable identifier
 * @returns {Object|null} - The node executable or null if not found
 */
export const getNodeExecutable = (identifier) => {
  return nodeExecutables[identifier] || null;
};

/**
 * Check if a node executable exists
 * @param {string} identifier - The node executable identifier
 * @returns {boolean}
 */
export const hasNodeExecutable = (identifier) => {
  return identifier in nodeExecutables;
};

/**
 * Get all available node executables
 * @returns {Object} - All registered node executables
 */
export const getAllNodeExecutables = () => {
  return Object.keys(nodeExecutables).map(key => ({
    identifier: key,
    ...nodeExecutables[key].metadata
  }));
};

export default nodeExecutables;
