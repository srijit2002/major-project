const fs = require("fs");
var execFile = require("child_process").execFile;
const path = require("path");
const { exec } = require("child_process");
const outputFile = path.resolve(__dirname, "result_v1.txt");
const COLUMN_LENGTH = 200;
class ConsecutiveIntegerIterator {
  constructor(filePath) {
    this.filePath = filePath;
    this.buffer = [];
    this.index = 0;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.filePath, "utf8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          this.buffer = data.trim().split(/\s+/).map(Number);
          resolve();
        }
      });
    });
  }

  next() {
    if (this.index + 3 <= this.buffer.length) {
      const triplet = [
        this.buffer[this.index],
        this.buffer[this.index + 1],
        this.buffer[this.index + 2],
      ];
      this.index++;
      return { value: triplet, done: false };
    } else {
      return { done: true };
    }
  }

  [Symbol.iterator]() {
    return this;
  }
}
function modPow(base, exp, mod) {
  if (exp === 0) return 1;
  var result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod;
    }
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}
function generateRandomText(length) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomText = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomText += characters.charAt(randomIndex);
  }
  return randomText;
}
function extractRandomSubstring(inputString) {
  // Generate a random start index within the range of the inputString length
  const startIndex = Math.floor(Math.random() * inputString.length);

  // Generate a random length for the substring
  const maxLength = Math.min(inputString.length - startIndex, 10); // Maximum length is 10 characters
  const length = Math.floor(Math.random() * maxLength) + 1; // Add 1 to ensure length is at least 1

  // Extract the substring using the random start index and length
  const substring = inputString.substr(startIndex, length);
  return substring;
}
function rsaEncrypt(text, n, e) {
  // Convert text to ASCII codes
  var asciiCodes = [];
  for (var i = 0; i < text.length; i++) {
    asciiCodes.push(text.charCodeAt(i));
  }

  // Encrypt each ASCII code
  var encryptedCodes = [];
  let txt = "";
  for (var j = 0; j < asciiCodes.length; j++) {
    let num = modPow(asciiCodes[j], e, n);
    txt += String.fromCharCode(num);
    encryptedCodes.push(num);
  }
  // Return encrypted ASCII codes
  return encryptedCodes;
}

// Function to decrypt text using RSA algorithm
function rsaDecrypt(encryptedCodes, n, d) {
  // Decrypt each encrypted ASCII code
  var decryptedCodes = [];
  for (var k = 0; k < encryptedCodes.length; k++) {
    decryptedCodes.push(modPow(encryptedCodes[k], d, n));
  }
  return decryptedCodes;
}
function calculateAccuracy(array1, array2) {
  // Check if arrays have the same length
  if (array1.length !== array2.length) {
    throw new Error("Arrays must have the same length");
  }

  // Initialize variables to count correct predictions
  let correctPredictions = 0;

  // Compare elements of the arrays
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] === array2[i]) {
      correctPredictions++;
    }
  }

  // Calculate accuracy
  const accuracy = (correctPredictions / array1.length) * 100;

  return accuracy;
}
function getOutPut(n, e, d) {
  let OriginalText = "Hello world";
  let OriginalCodes = [];
  for (let i in OriginalText) {
    OriginalCodes.push(OriginalText.charCodeAt(i));
  }
  let res = "Accuracy -> ";
  let encryptedCodes = rsaEncrypt(OriginalText, n, e);
  res += `${calculateAccuracy(
    OriginalCodes,
    rsaDecrypt(encryptedCodes, n, d)
  )}%`;
  return res;
}
function modExp(base, exponent, modulus) {
  if (modulus === 1) return 0; // Edge case: modulus is 1
  let result = 1;
  base = base % modulus;
  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = (result * base) % modulus;
    }
    exponent = Math.floor(exponent / 2);
    base = (base * base) % modulus;
  }
  return result;
}
function encryptCharacter(asciiValue, publicKey, n) {
  return modExp(asciiValue, publicKey, n);
}
function print(text) {
  return text.toString().padEnd(COLUMN_LENGTH - text.length);
}
async function main() {
  const filePath = "test_set.txt";
  const iterator = new ConsecutiveIntegerIterator(filePath);
  await iterator.initialize();

  for (const triplet of iterator) {
    const randomText = generateRandomText(10);
    const substring = extractRandomSubstring(randomText);
    const substringCode = [];
    for (let i in substring) {
      substringCode.push(substring.charCodeAt(i));
    }
    let cipherText = [];
    let index = 1;
    for (let i in randomText) {
      cipherText.push(
        encryptCharacter(randomText.charCodeAt(i), triplet[1], triplet[0])
      );
    }
    const privateKeys = [];
    for (let i = 0; i < 99; i++) {
      privateKeys.push(Math.floor(Math.random() * 10000)); // Assuming keys are within this range
    }
    privateKeys.push(triplet[2]);
    for (let i = privateKeys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [privateKeys[i], privateKeys[j]] = [privateKeys[j], privateKeys[i]];
    }
    execFile(
      path.resolve(__dirname, "ant_colony_v1.exe"),
      [
        substringCode.length,
        ...substringCode,
        cipherText.length,
        ...cipherText,
        triplet[1],
        triplet[0],
        privateKeys.length,
        ...privateKeys,
      ],
      (error, stdout, stderr) => {
        console.log(error, stdout, stderr);
        if (stderr) {
          console.log(stderr);
        } else {
          fs.appendFile(
            outputFile,
            `${getOutPut(triplet[0], triplet[1], stdout)}\n`,
            (err) => {
              if (err) {
                console.error(
                  `Error writing to file for row ${index + 2}:`,
                  err
                );
                return;
              }
              console.log(`Output for row ${index + 2} saved to ${outputFile}`);
            }
          );
        }
      }
    );
  }
}
exec("g++ ant_colony_v1.cpp -o ant_colony_v1", (err, stdout, stderr) => {
  if (err) {
    console.log(err);
    return;
  }
  main().catch((err) => console.error("Error:", err));
});
