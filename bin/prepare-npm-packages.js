#!/usr/bin/node
import fs from 'fs';
import path from 'path';

const rootDir = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '..'
);

const rootPackageJson = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
);

delete rootPackageJson.jest;
delete rootPackageJson.devDependencies;
delete rootPackageJson.scripts;

const overrides = new Map(
  ['core', 'react', 'preact'].map((module) => [
    module,
    JSON.parse(
      fs.readFileSync(
        path.join(rootDir, `src/${module}/pkg-override.json`),
        'utf8'
      )
    ),
  ])
);

for (const [name, override] of overrides) {
  const packageJson = { ...override, ...rootPackageJson };
  fs.writeFileSync(
    path.join(rootDir, `dist/${name}/package.json`),
    JSON.stringify(packageJson, null, 2),
    'utf8'
  );
}

console.log('Updated package.json files for outputs');
