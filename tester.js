const fs = require("fs");
const xlsx = require("xlsx");
var execFile = require("child_process").execFile;
const path = require("path");
const { exec } = require("child_process");
const COLUMN_LENGTH = 50;
// Read the Excel file
const workbook = xlsx.readFile("keys.xlsx");
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const keysData = xlsx.utils.sheet_to_json(worksheet);

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
function encryptCharacter(character, publicKey, n) {
  // Convert the character to its ASCII representation
  const asciiValue = character.charCodeAt(0);

  // Encrypt the ASCII value using RSA algorithm
  const encryptedValue = modExp(asciiValue, publicKey, n);

  // Convert the encrypted value back to its corresponding ASCII character
  const encryptedCharacter = String.fromCharCode(encryptedValue);

  return encryptedCharacter;
}

// Modular exponentiation function
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
let ec = "Encrypted Message";
let om = "Original Message";
let dm = "Decrypted Message";
const outputFile = path.resolve(__dirname, "result.txt");
function print(text) {
  return text.padEnd(COLUMN_LENGTH - text.length);
}
fs.writeFileSync(outputFile, `${print(ec)}${print(om)}${print(dm)}\n`);
function getOutPut(n, e, d) {
  let OriginalText = "Hello world";
  let res = "";
  let { encryptedCodes, txt } = rsaEncrypt(OriginalText, n, e);
  res += print(txt);
  res += print(OriginalText);
  res += print(rsaDecrypt(encryptedCodes, n, d));
  return res;
}
exec("g++ ant_colony.cpp -o ant_colony", (err, stdout, stderr) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Started-----");
  keysData.forEach((rowData, index) => {
    // Generate random text
    const randomText = generateRandomText(10);
    const substring = extractRandomSubstring(randomText);
    let cipherText = "";
    for (let c of randomText) {
      cipherText += encryptCharacter(c, rowData.public_key, rowData.n);
    }
    // Generate a list of 99 random numbers
    const privateKeys = [];
    for (let i = 0; i < 99; i++) {
      privateKeys.push(Math.floor(Math.random() * 10000)); // Assuming keys are within this range
    }
    // Add the private key from Excel file to the list
    privateKeys.push(rowData.private_key);

    // Shuffle the privateKeys array
    for (let i = privateKeys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [privateKeys[i], privateKeys[j]] = [privateKeys[j], privateKeys[i]];
    }

    execFile(
      path.resolve(__dirname, "ant_colony.exe"),
      [substring, cipherText, rowData.public_key, rowData.n, ...privateKeys],
      (error, stdout, stderr) => {
        if (stderr) {
          console.log(stderr);
        } else {
          let private_key = rowData.private_key.toString();
          fs.appendFile(
            outputFile,
            `${getOutPut(rowData.n, rowData.public_key, stdout)}\n`,
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
  });
});

// Function to encrypt text using RSA algorithm
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
  return { encryptedCodes, txt };
}

// Function to decrypt text using RSA algorithm
function rsaDecrypt(encryptedCodes, n, d) {
  // Decrypt each encrypted ASCII code
  var decryptedCodes = [];
  for (var k = 0; k < encryptedCodes.length; k++) {
    decryptedCodes.push(modPow(encryptedCodes[k], d, n));
  }

  // Convert ASCII codes to characters and concatenate
  var decryptedText = "";
  for (var l = 0; l < decryptedCodes.length; l++) {
    decryptedText += String.fromCharCode(decryptedCodes[l]);
  }

  // Return decrypted text
  return decryptedText;
}

// Function to perform modular exponentiation
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
