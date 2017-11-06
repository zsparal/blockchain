// @flow

import { hash, sign, SignKeyPair } from "tweetnacl";

export function toHexString(byteArray: Uint8Array) {
  return Array.from(byteArray, byte => {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}

let keyPair: SignKeyPair;
export function getKeyPair(): SignKeyPair {
  if (!keyPair) {
    keyPair = sign.keyPair();
  }
  return keyPair;
}

export function generateSignature(
  secretKey: Uint8Array,
  messageObject: Object
) {
  const enc = new TextEncoder();
  const serializedMessage = JSON.stringify(messageObject);
  const hashedMessage = hash(enc.encode(serializedMessage));
  const signature = sign.detached(hashedMessage, secretKey);
  return toHexString(signature);
}
