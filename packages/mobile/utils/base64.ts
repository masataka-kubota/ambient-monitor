export const base64 = {
  encode: (str: string): string => {
    const utf8Bytes = new TextEncoder().encode(str);
    let binary = "";
    utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  },
  decode: (base64Str: string): string => {
    const binary = atob(base64Str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  },
};
