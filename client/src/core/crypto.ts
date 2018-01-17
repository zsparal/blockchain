import * as nacl from "tweetnacl";
import { TextEncoder } from "text-encoding";

let keyPair: nacl.SignKeyPair;
keyPair =
  keyPair! ||
  (function() {
    const storedKey = localStorage.getItem("secretKey");
    if (storedKey) {
      return nacl.sign.keyPair.fromSecretKey(hexStringToByte(storedKey));
    } else {
      const key = nacl.sign.keyPair();
      localStorage.setItem("secretKey", byteToHexString(key.secretKey));
      return key;
    }
  })();

const encoder = new TextEncoder();

export function byteToHexString(uint8arr: Uint8Array): string {
  if (!uint8arr) {
    return "";
  }

  var hexStr = "";
  for (let i = 0; i < uint8arr.length; i++) {
    var hex = (uint8arr[i] & 0xff).toString(16);
    hex = hex.length === 1 ? "0" + hex : hex;
    hexStr += hex;
  }

  return hexStr.toLowerCase();
}

export function hexStringToByte(str: string): Uint8Array {
  if (!str) {
    return new Uint8Array([]);
  }

  var a = [];
  for (let i = 0, len = str.length; i < len; i += 2) {
    a.push(parseInt(str.substr(i, 2), 16));
  }

  return new Uint8Array(a);
}

export function getPublicKey(): string {
  return byteToHexString(keyPair.publicKey);
}

export function sign<T>(value: T): string {
  const messageBytes = encoder.encode(JSON.stringify(value));
  return byteToHexString(nacl.sign.detached(messageBytes, keyPair.secretKey));
}

export function hash<T>(value: T): string {
  const message = encoder.encode(JSON.stringify(value));
  return byteToHexString(nacl.hash(message));
}
