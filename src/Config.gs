/**
 * Public-safe config: no internal IDs, no proprietary names.
 * Customize tab names + columns for your own sheet.
 */
const CONFIG = {
  SHEET_NAME: null, // null means "active spreadsheet"
  TAB_A: "SOURCE_A",
  TAB_B: "SOURCE_B",
  OUTPUT_TAB: "MATCH_RESULTS",

  // Columns expected in each source (by header name)
  // Example headers:
  // A: ["Record ID", "Amount", "Date", "Reference"]
  // B: ["Txn ID", "Amount", "Date", "Memo"]
  A_HEADERS: {
    ID: "Record ID",
    AMOUNT: "Amount",
    DATE: "Date",
    REF: "Reference",
  },
  B_HEADERS: {
    ID: "Txn ID",
    AMOUNT: "Amount",
    DATE: "Date",
    REF: "Memo",
  },

  // Matching rules
  RULES: {
    AMOUNT_TOLERANCE: 0.00, // exact by default
    MAX_DATE_DISTANCE_DAYS: 7, // allow +- 7 days
    MIN_SCORE_TO_MATCH: 70,
  },
};
