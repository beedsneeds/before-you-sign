# cs-546-project

#### After a fetch:

- Run `npm install` to install all deps

#### Before a push:

- Run `npm run format`

## General

Use `npm run dev` to run TS in development

Run `npm start` to run compiled js AFTER `npm run build` compiles all ts to js into /dist

Strong Typechecking tips:

- Never use `any` unless prototyping
- Use Zod for validating incoming data

#### Imports

Use the .js extension _only_ for import paths even if the actual file is a .ts
We will not set allowImportingTsExtensions

