import assert from 'node:assert/strict';
import { migrateWorkspace } from '../packages/workspace/index.mjs';

const future = {
  schema: 'mcard-starterkit.workspace.v3',
  version: 3,
  project: { name: 'Future' },
  futureOnly: true
};

const migrated = migrateWorkspace(future);
assert.equal(migrated.schema, 'mcard-starterkit.workspace.v2');
assert.equal(migrated.validation.ok, true);
assert.equal(migrated.compatibility.originalSchema, 'mcard-starterkit.workspace.v3');
assert.equal(migrated.compatibility.original.futureOnly, true);

console.log('workspace future migration tests passed');
