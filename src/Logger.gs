function logInfo(msg, data) {
  if (data !== undefined) {
    console.log(`[INFO] ${msg}`, data);
  } else {
    console.log(`[INFO] ${msg}`);
  }
}

function logWarn(msg, data) {
  if (data !== undefined) {
    console.warn(`[WARN] ${msg}`, data);
  } else {
    console.warn(`[WARN] ${msg}`);
  }
}
