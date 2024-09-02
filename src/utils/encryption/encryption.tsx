import CryptoJS from 'crypto-js';

const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPT_KEY ?? ""; // Replace with a strong, randomly generated key


interface EncryptionData {
    data: string;
}

const encrypt = ({ data }: EncryptionData): string => {
    const ciphertext = CryptoJS.AES.encrypt(data, encryptionKey).toString();
    return ciphertext;
};

const decrypt = ({ data }: EncryptionData): string => {
    const bytes = CryptoJS.AES.decrypt(data, encryptionKey);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return plaintext;
};

export { encrypt, decrypt };