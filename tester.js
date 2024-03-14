const fs = require("fs");
const xlsx = require("xlsx");
var execFile = require("child_process").execFile;
const path = require("path");
const { exec } = require("child_process");
const { log } = require("console");

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
const outputFile = path.resolve(__dirname, "result.txt");
fs.writeFileSync(outputFile, `${"Original".padEnd(16)} Found\n`);
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
            `${private_key.padEnd(20 - private_key.length)} ${stdout}`,
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
