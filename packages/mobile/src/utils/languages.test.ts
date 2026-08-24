import { isSupportedLanguageCode } from './languages';

describe('isSupportedLanguageCode', () => {
  it('returns false for null', () => {
    expect(isSupportedLanguageCode(null)).toBe(false);
  });

  it('returns true for supported values', () => {
    expect(isSupportedLanguageCode('en')).toBe(true);
    expect(isSupportedLanguageCode('ja')).toBe(true);
  });

  it('returns false for unsupported values', () => {
    expect(isSupportedLanguageCode('fr')).toBe(false);
    expect(isSupportedLanguageCode('zh')).toBe(false);
    expect(isSupportedLanguageCode('')).toBe(false);
  });
});
