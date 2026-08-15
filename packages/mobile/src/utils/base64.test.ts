import { base64 } from './base64';

describe('base64', () => {
  const asciiInput = 'hello';
  const asciiExpected = 'aGVsbG8=';
  const utf8Input = '日本語';
  const utf8Expected = '5pel5pys6Kqe';
  const emojiInput = '🌡️';
  const emojiExpected = '8J+Moe+4jw==';

  describe('encode', () => {
    it('encodes an ASCII string', () => {
      expect(base64.encode(asciiInput)).toBe(asciiExpected);
    });

    it('encodes an empty string', () => {
      expect(base64.encode('')).toBe('');
    });

    it('encodes a string without padding when the length is a multiple of 3', () => {
      expect(base64.encode('hello world')).toBe('aGVsbG8gd29ybGQ=');
      expect(base64.encode('hello world!')).toBe('aGVsbG8gd29ybGQh');
    });

    it('encodes UTF-8 multibyte characters', () => {
      expect(base64.encode(utf8Input)).toBe(utf8Expected);
    });

    it('encodes emoji (4-byte UTF-8)', () => {
      expect(base64.encode(emojiInput)).toBe(emojiExpected);
    });
  });

  describe('decode', () => {
    it('decodes an ASCII string', () => {
      expect(base64.decode(asciiExpected)).toBe(asciiInput);
    });

    it('decodes an empty string', () => {
      expect(base64.decode('')).toBe('');
    });

    it('decodes UTF-8 multibyte characters', () => {
      expect(base64.decode(utf8Expected)).toBe(utf8Input);
    });

    it('decodes emoji (4-byte UTF-8)', () => {
      expect(base64.decode(emojiExpected)).toBe(emojiInput);
    });
  });

  describe('round trip', () => {
    const testCases = [
      'hello world',
      '日本語のテキスト',
      'mixed 日本語 and emoji 🌡️',
      'line\nbreak\ttab',
      '<script>&"quotes"',
    ];

    it.each(testCases)('decode(encode(%j)) returns the original string', (input) => {
      expect(base64.decode(base64.encode(input))).toBe(input);
    });
  });
});
