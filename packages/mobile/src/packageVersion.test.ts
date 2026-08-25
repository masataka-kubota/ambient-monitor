import pkg from '../package.json';

/** Apple CFBundleShortVersionString: exactly three non-negative integers (MAJOR.MINOR.PATCH, e.g. 1.2.3). Apple rejects four-part values like 0.9.7.1. */
const APP_STORE_VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

describe('package.json version', () => {
  it('is a three-part App Store marketing version', () => {
    const hint =
      'Use MAJOR.MINOR.PATCH (e.g. 0.9.8). Apple CFBundleShortVersionString allows at most three segments (not four-part values like 0.9.7.1).';

    expect({
      version: pkg.version,
      hint,
      valid: APP_STORE_VERSION_PATTERN.test(pkg.version),
    }).toEqual({
      version: pkg.version,
      hint,
      valid: true,
    });
  });
});
