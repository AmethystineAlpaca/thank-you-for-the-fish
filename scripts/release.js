// Run from the source checkout to release. Also used by the GitHub workflow.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (process.platform !== 'darwin') throw new Error('The release archive must be built on macOS.');
if (process.env.RELEASE_TAG && process.env.RELEASE_TAG !== `v${pkg.version}`) {
  throw new Error('Release tag does not match package.json.');
}
const run = (command, args) => execFileSync(command, args, { cwd: root, stdio: 'inherit' });
run('npm', ['test']);
run('npm', ['run', 'package']);
const app = path.join(root, 'dist/Thank You for the Fish-darwin-arm64/Thank You for the Fish.app');
const bundledVersion = execFileSync('/usr/libexec/PlistBuddy', [
  '-c', 'Print CFBundleShortVersionString', path.join(app, 'Contents/Info.plist'),
], { encoding: 'utf8' }).trim();
if (bundledVersion !== pkg.version) throw new Error('Packaged version is incorrect.');
const dist = path.join(root, 'dist');
const filename = 'thank-you-for-the-fish-macos-arm64.zip';
const archive = path.join(dist, filename);
// ditto preserves the app bundle's executable bits and framework symlinks.
if (fs.existsSync(archive)) fs.unlinkSync(archive);
run('/usr/bin/ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', app, archive]);
const hash = crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
fs.writeFileSync(path.join(dist, 'SHA256SUMS.txt'), `${hash}  ${filename}\n`);
console.log(`Release v${pkg.version}: ${archive}\nSHA-256: ${hash}`);
