import CryptoJS from "crypto-js"

export function encryptValue(value: string, password: string): string {
  return CryptoJS.AES.encrypt(value, password).toString()
}

export function decryptValue(encryptedValue: string, password: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedValue, password)
  return bytes.toString(CryptoJS.enc.Utf8)
}
