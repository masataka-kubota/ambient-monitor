/**
 * UTF-8 Base64 helpers for encoding and decoding strings.
 *
 * This uses the browser's `TextEncoder` / `TextDecoder` APIs so that
 * multibyte characters such as Japanese text and emoji are handled safely.
 */
export const base64 = {
  /**
   * Encodes a UTF-8 string to a Base64 string.
   *
   * @param str - The string to encode.
   * @returns The Base64-encoded string.
   */
  encode: (str: string): string => {
    const utf8Bytes = new TextEncoder().encode(str);
    let binary = '';
    utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  },

  /**
   * Decodes a Base64 string into a UTF-8 string.
   *
   * @param base64Str - The Base64 string to decode.
   * @returns The decoded UTF-8 string.
   */
  decode: (base64Str: string): string => {
    const binary = atob(base64Str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  },
};
