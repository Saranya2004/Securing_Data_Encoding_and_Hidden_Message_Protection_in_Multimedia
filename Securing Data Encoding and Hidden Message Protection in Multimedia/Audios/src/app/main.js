// main.js
document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("mp3Input");
    const messageField = document.getElementById("secretMessage");
    const passwordField = document.getElementById("password");
    const embedBtn = document.getElementById("embedNow");
    const downloadBox = document.getElementById("downloadBox");
    const downloadBtn = document.getElementById("downloadBtn");
  
    let mp3;
    let readyToDownload = false;
  
    input.addEventListener("change", function () {
      const file = input.files[0];
      if (!file || !file.name.endsWith(".mp3")) {
        alert("Please select a valid MP3 file.");
        return;
      }
  
      const reader = new FileReader();
      reader.onload = function () {
        mp3 = new MP3Stego(file.name, reader.result);
        console.log("✅ MP3 Loaded");
  
        if (mp3.isModified()) {
          alert("This MP3 already contains a hidden message.");
        } else {
          alert("🎵 MP3 loaded! You can now embed your message.");
        }
      };
      reader.readAsArrayBuffer(file);
    });
  
    embedBtn.addEventListener("click", function () {
      if (!mp3) {
        alert("Please load an MP3 file first.");
        return;
      }
  
      const message = messageField.value.trim();
      const password = passwordField.value;
  
      if (!message) {
        alert("Please enter a secret message.");
        return;
      }
  
      let byteMessage;
  
      if (password) {
        try {
          const encrypted = CryptoJS.AES.encrypt(message, password, {
            mode: CryptoJS.mode.CTR,
            padding: CryptoJS.pad.NoPadding
          });
  
          const raw = atob(encrypted.toString()).substring(8); // remove "Salted__"
          byteMessage = raw.split("").map(c => c.charCodeAt(0));
        } catch (e) {
          alert("Encryption error: " + e.message);
          return;
        }
      } else {
        byteMessage = encodeUTF8(message);
      }
  
      try {
        mp3.embedText(byteMessage);
        readyToDownload = true;
        downloadBox.classList.remove("hide");
        alert("✅ Message embedded successfully! Click the Download button.");
      } catch (err) {
        alert("Failed to embed message: " + err.message);
      }
    });
  
    downloadBtn.addEventListener("click", function () {
      if (readyToDownload && mp3) {
        mp3.download();
        alert("✅  MP3 downloaded with your hidden message!");
      } else {
        alert("Please embed a message first!");
      }
    });
  });
  