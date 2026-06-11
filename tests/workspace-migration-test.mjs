import assert from 'node:assert/strict';
import { migrateWorkspace, CURRENT_WORKSPACE_SCHEMA } from '../packages/workspace/index.mjs';

const v1 = {
  schema: 'mcard-starterkit.workspace.v1',
  activeProfile: { id: 'monicard-like.sample', title: 'Sample' },
  packageJson: '{}',
  latestFilePlan: { totalPackets: 1 }
};

const migrated = migrateWorkspace(v1);
assert.equal(migrated.schema, CURRENT_WORKSPACE_SCHEMA);
assert.equal(migrated.validation.ok, true);
assert.equal(migrated.profiles.activeProfile.id, 'monicard-like.sample');
assert.equal(migrated.transfer.latestFilePlan.totalPackets, 1);

console.log('workspace migration tests passed');
