# Before You Sign

#### After a fetch:

- Run `npm install` to install all deps

#### Before a push:

- Run `npm run format`

## Github Housekeeping:

```bash
git checkout main
git pull
git checkout <branch>
git merge main # or suggest
git push origin <branch>
```

## General

Set-up:

- `sudo systemctl start mongod` (add your mongod cmd if you'd like) and `npm run seeddb`
- Use `npm run dev` to run TS in development

Run `npm start` to run compiled js AFTER `npm run build` compiles all ts to js into /dist

Strong Typechecking tips:

- Never use `any` unless prototyping
- See data/models/README.md

#### Imports

Use the .js extension _only_ for import paths even if the actual file is a .ts
We will not set allowImportingTsExtensions
