/*
 * Copyright (c) 2022 FinancialForce.com, inc. All rights reserved.
 */

// Jest does not support this as ESM yet

module.exports = {
  // resolves from test to snapshot path
  resolveSnapshotPath: (testPath, snapshotExtension) =>
    testPath.replace("dist/test", "snapshots") + snapshotExtension,

  // resolves from snapshot to test path
  resolveTestPath: (snapshotFilePath, snapshotExtension) =>
    snapshotFilePath
      .replace("snapshots", "dist/test")
      .slice(0, -snapshotExtension.length),

  // Example test path, used for preflight consistency check of the implementation above
  testPathForConsistencyCheck: "dist/test/example.test.js",
};
