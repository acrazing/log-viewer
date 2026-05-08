const fs = require('fs-extra');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteDir = path.join(root, 'site');
const outDir = path.join(root, 'dist-site');

async function main() {
  await fs.remove(outDir);
  await fs.copy(siteDir, outDir);
  await fs.copy(path.join(root, 'src/assets/img'), path.join(outDir, 'assets/img'), {
    filter(src) {
      return !src.endsWith('-full.png');
    },
  });
  await fs.writeFile(path.join(outDir, '.nojekyll'), '');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
