module.exports = {
	// resolves from test to snapshot path
	resolveSnapshotPath: (testPath, snapshotExtension) =>
		testPath.replace('lib/__tests__', 'snapshots') + snapshotExtension,

	// resolves from snapshot to test path
	resolveTestPath: (snapshotFilePath, snapshotExtension) =>
		snapshotFilePath
			.replace('snapshots', 'lib/__tests__')
			.slice(0, -snapshotExtension.length),

	// Example test path, used for preflight consistency check of the implementation above
	testPathForConsistencyCheck: 'lib/__tests__/example.test.js',
};
