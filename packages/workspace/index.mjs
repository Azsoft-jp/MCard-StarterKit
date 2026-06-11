export const CURRENT_WORKSPACE_SCHEMA = 'mcard-starterkit.workspace.v2';

export function migrateWorkspace(input = {}) {
  if (!input || typeof input !== 'object') {
    return makeEmptyWorkspace();
  }

  if (input.schema === CURRENT_WORKSPACE_SCHEMA) {
    return validateWorkspace(input);
  }

  if (input.schema === 'mcard-starterkit.workspace.v1' || input.schema == null) {
    const migrated = {
      schema: CURRENT_WORKSPACE_SCHEMA,
      version: 2,
      migratedAt: new Date().toISOString(),
      project: {
        name: input.project?.name || input.activeProfile?.title || 'MCard StarterKit Workspace',
        notes: input.project?.notes || ''
      },
      profiles: {
        activeProfile: input.activeProfile || null,
        profileEditor: input.profileEditor || ''
      },
      media: {
        packageJson: input.packageJson || '',
        pkgName: input.pkgName || 'badge-media',
        pkgType: input.pkgType || 'image',
        pkgSource: input.pkgSource || '',
        latestMediaPackage: input.latestMediaPackage || null,
        latestAnimationManifest: input.latestAnimationManifest || null
      },
      transfer: {
        latestFilePlan: input.latestFilePlan || null,
        scheduler: input.scheduler || null
      },
      logs: {
        bleLog: input.bleLog || [],
        combinedLog: input.combinedLog || null
      }
    };
    return validateWorkspace(migrated);
  }

  return preserveUnknownWorkspace(input);
}

export function makeEmptyWorkspace() {
  return {
    schema: CURRENT_WORKSPACE_SCHEMA,
    version: 2,
    createdAt: new Date().toISOString(),
    project: {
      name: 'MCard StarterKit Workspace',
      notes: ''
    },
    profiles: {
      activeProfile: null,
      profileEditor: ''
    },
    media: {
      packageJson: '',
      pkgName: 'badge-media',
      pkgType: 'image',
      pkgSource: '',
      latestMediaPackage: null,
      latestAnimationManifest: null
    },
    transfer: {
      latestFilePlan: null,
      scheduler: null
    },
    logs: {
      bleLog: [],
      combinedLog: null
    }
  };
}

export function validateWorkspace(workspace) {
  const errors = [];
  if (workspace.schema !== CURRENT_WORKSPACE_SCHEMA) errors.push('invalid schema');
  if (typeof workspace.project !== 'object') errors.push('missing project object');
  if (typeof workspace.profiles !== 'object') errors.push('missing profiles object');
  if (typeof workspace.media !== 'object') errors.push('missing media object');
  if (typeof workspace.transfer !== 'object') errors.push('missing transfer object');
  if (typeof workspace.logs !== 'object') errors.push('missing logs object');

  return {
    ...workspace,
    validation: {
      ok: errors.length === 0,
      errors
    }
  };
}


export function preserveUnknownWorkspace(input = {}) {
  return {
    schema: CURRENT_WORKSPACE_SCHEMA,
    version: 2,
    migratedAt: new Date().toISOString(),
    project: {
      name: input.project?.name || 'Imported future workspace',
      notes: 'Imported from newer or unknown workspace schema. Original content preserved in compatibility.original.'
    },
    profiles: { activeProfile: null, profileEditor: '' },
    media: { packageJson: '', pkgName: 'badge-media', pkgType: 'image', pkgSource: '', latestMediaPackage: null, latestAnimationManifest: null },
    transfer: { latestFilePlan: null, scheduler: null },
    logs: { bleLog: [], combinedLog: null },
    compatibility: {
      originalSchema: input.schema || null,
      original: input
    },
    validation: {
      ok: true,
      errors: [],
      warnings: ['workspace schema is newer or unknown; original content preserved']
    }
  };
}
