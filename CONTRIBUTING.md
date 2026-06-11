# Contributing

Thank you for contributing to MCard-StarterKit.

## Clean-room rules

Do not add:

- vendor cloud endpoints,
- official assets,
- captured application code,
- firmware blobs,
- private IDs or tokens,
- HAR or extracted package artifacts.

## Development

```bash
npm test
npm start
```

## Plugin policy

Prefer profile JSON and JSON rule parsers over executable plugins.

Executable plugins should not be added until a sandbox policy is documented.

## Hardware policy

Hardware docs are planning aids. Do not treat them as certified designs.


## Before opening a PR

Run:

```bash
npm test
```

Checklist:

- Update docs if public behavior changed.
- Add tests for new parser, frame, transport, or workspace behavior.
- Add a sample profile or test vector if protocol behavior changed.
- Keep device-specific constants in profiles.
- Prefer JSON rules over executable parser code when possible.
- Do not add vendor endpoints, official assets, captured app code, firmware blobs, private identifiers, HAR files, or extracted package artifacts.
- Keep BLE operations opt-in.
- Keep OTA behavior limited to local verification and planning unless a separate safety review changes the scope.
