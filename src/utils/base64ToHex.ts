export default function base64ToHex(base64: string) {
  return Buffer.from(base64, 'base64').toString('hex');
}
