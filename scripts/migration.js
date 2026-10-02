const { spawnSync } = require('child_process');
const path = require('path');
const pkg = require('../package.json');

const action = process.argv[2];
const fromArg = process.argv[3];
const fromNpm = process.env.npm_config_name;
const name = fromArg || (fromNpm !== pkg.name ? fromNpm : undefined);

if (!['generate', 'create'].includes(action) || !name) {
  console.error(
    'Usage: npm run migration:generate --name=update_table\n' +
      '   or: npm run migration:generate -- update_table',
  );
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [
    '-r',
    'tsconfig-paths/register',
    path.join('node_modules', 'typeorm', 'cli-ts-node-commonjs.js'),
    '-d',
    path.join('src', 'common', 'database', 'data-source.ts'),
    `migration:${action}`,
    path.join('src', 'common', 'database', 'migrations', name),
  ],
  { stdio: 'inherit' },
);

process.exit(result.status ?? 1);
