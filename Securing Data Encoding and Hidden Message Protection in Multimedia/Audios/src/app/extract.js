// extract.js
document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("mp3Input");
    const passwordField = document.getElementById("password");
    const output = document.getElementById("messageOutput");
    const extractBtn = document.getElementById("extractNow");
    const copyBtn = document.getElementById("copyBtn");
  
    let mp3;
  
    // Load MP3 file
    input.addEventListener("change", function () {
      const file = input.files[0];
      if (!file || !file.name.endsWith(".mp3")) {
        alert("Please select a valid MP3 file.");
        return;
      }
  
      const reader = new FileReader();
      reader.onload = function () {
        try {
          mp3 = new MP3Stego(file.name, reader.result);
          if (!mp3.isModified()) {
            alert("This file does not contain a hidden message.");
          } else {
            alert("✅ Stego MP3 loaded! Ready to extract.");
          }
        } catch (e) {
          alert("Failed to load MP3: " + e.message);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  
    // Extract message
    extractBtn.addEventListener("click", function () {
      if (!mp3) {
        alert("Please load a stego MP3 file first.");
        return;
      }
  
      try {
        let bytes = mp3.extractText();
        const password = passwordField.value;
  
        if (password) {
          const str = btoa("Salted__" + String.fromCharCode.apply(null, bytes));
          const decrypted = CryptoJS.AES.decrypt(str, password, {
            mode: CryptoJS.mode.CTR,
            padding: CryptoJS.pad.NoPadding
          });
          bytes = wordArrayToByteArray(decrypted);
        }
  
        const message = decodeUTF8(bytes);
        output.value = message;
        alert("✅ Message extracted successfully!");
      } catch (e) {
        alert("❌ Failed to extract message: " + e.message);
      }
    });
  
    // Copy to clipboard
    copyBtn.addEventListener("click", function () {
      output.select();
      document.execCommand("copy");
      alert("📋 Message copied to clipboard!");
    });
  });
  