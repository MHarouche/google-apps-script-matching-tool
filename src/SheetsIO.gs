function getSpreadsheet_() {
  return CONFIG.SHEET_NAME
    ? SpreadsheetApp.openById(CONFIG.SHEET_NAME)
    : SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function readTableByHeaders_(sheet, requiredHeadersMap) {
  const values = sheet.getDataRange().getValues();
  if (!values.length) return { rows: [], headerIndex: {} };

  const headers = values[0].map(String);
  const headerIndex = {};
  headers.forEach((h, i) => (headerIndex[h.trim()] = i));

  // Validate required headers exist
  Object.keys(requiredHeadersMap).forEach((k) => {
    const headerName = requiredHeadersMap[k];
    if (headerIndex[headerName] === undefined) {
      throw new Error(`Missing required header "${headerName}" in sheet "${sheet.getName()}"`);
    }
  });

  const rows = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    // Skip fully empty rows
    if (row.every((c) => c === "" || c === null)) continue;
    rows.push(row);
  }

  return { rows, headerIndex };
}

function writeResults_(sheet, headers, rows) {
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}
