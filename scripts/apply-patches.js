const { execSync } = require('child_process');

try {
  execSync('patch-package', { stdio: 'inherit' });
} catch (error) {
  console.log('\n⚠️  Note: Some patches may fail locally (Android files generated during EAS build)');
  console.log('   Patches will be applied automatically during EAS build.\n');
  // Exit with success to allow npm install to continue
  process.exit(0);
}

