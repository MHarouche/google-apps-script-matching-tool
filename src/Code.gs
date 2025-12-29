/**
 * Entry point — run this manually.
 */
function runMatching() {
  const ss = getSpreadsheet_();

  const sheetA = ss.getSheetByName(CONFIG.TAB_A);
  const sheetB = ss.getSheetByName(CONFIG.TAB_B);
  if (!sheetA || !sheetB) {
    throw new Error(`Missing source tabs. Expected "${CONFIG.TAB_A}" and "${CONFIG.TAB_B}".`);
  }

  const aTable = readTableByHeaders_(sheetA, CONFIG.A_HEADERS);
  const bTable = readTableByHeaders_(sheetB, CONFIG.B_HEADERS);

  const aRecs = aTable.rows.map((row, i) => ({
    _idx: i,
    id: row[aTable.headerIndex[CONFIG.A_HEADERS.ID]],
    amount: normalizeAmount_(row[aTable.headerIndex[CONFIG.A_HEADERS.AMOUNT]]),
    date: normalizeDate_(row[aTable.headerIndex[CONFIG.A_HEADERS.DATE]]),
    ref: row[aTable.headerIndex[CONFIG.A_HEADERS.REF]],
    tokens: tokenize_(row[aTable.headerIndex[CONFIG.A_HEADERS.REF]]),
    raw: row,
  }));

  const bRecs = bTable.rows.map((row, i) => ({
    _idx: i,
    id: row[bTable.headerIndex[CONFIG.B_HEADERS.ID]],
    amount: normalizeAmount_(row[bTable.headerIndex[CONFIG.B_HEADERS.AMOUNT]]),
    date: normalizeDate_(row[bTable.headerIndex[CONFIG.B_HEADERS.DATE]]),
    ref: row[bTable.headerIndex[CONFIG.B_HEADERS.REF]],
    tokens: tokenize_(row[bTable.headerIndex[CONFIG.B_HEADERS.REF]]),
    raw: row,
  }));

  logInfo("Loaded records", { a: aRecs.length, b: bRecs.length });

  const results = matchRecords_(aRecs, bRecs);

  const out = getOrCreateSheet_(ss, CONFIG.OUTPUT_TAB);
  const headers = [
    "A_ID",
    "A_AMOUNT",
    "A_DATE",
    "A_REF",
    "STATUS",
    "SCORE",
    "B_ID",
    "B_AMOUNT",
    "B_DATE",
    "B_REF",
  ];

  const rows = results.map((r) => [
    r.a.id,
    r.a.amount,
    r.a.date,
    r.a.ref,
    r.status,
    r.score,
    r.b ? r.b.id : "",
    r.b ? r.b.amount : "",
    r.b ? r.b.date : "",
    r.b ? r.b.ref : "",
  ]);

  writeResults_(out, headers, rows);
  logInfo("Done. Wrote results to", CONFIG.OUTPUT_TAB);
}
