document.addEventListener("DOMContentLoaded", function () {
    // Add event listeners only if the elements exist
    if (document.getElementById("startEncode")) {
        document.getElementById("startEncode").addEventListener("click", encodeImage);
        document.getElementById("downloadEncoded").addEventListener("click", downloadEncodedImage);
    }

    if (document.getElementById("startDecode")) {
        document.getElementById("startDecode").addEventListener("click", decodeMessageFromImage);
    }
});

// **ENCODING FUNCTION**
function encodeImage() {
    let fileInput = document.getElementById("encodeFile");
    let message = document.getElementById("message").value;
    let password = document.getElementById("password").value;
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");

    if (fileInput.files.length === 0) {
        alert("Please select an image.");
        return;
    }

    let file = fileInput.files[0];
    let reader = new FileReader();

    reader.onload = function (event) {
        let img = new Image();
        img.src = event.target.result;

        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            if (password.length > 0) {
                message = sjcl.encrypt(password, message);
            } else {
                message = JSON.stringify({ text: message });
            }

            encodeMessage(imageData.data, message);
            ctx.putImageData(imageData, 0, 0);

            document.getElementById("encodedPreview").src = canvas.toDataURL();
            document.getElementById("encodedPreview").style.display = "block";
        };
    };

    reader.readAsDataURL(file);
}

// **ENCODE MESSAGE INTO IMAGE**
function encodeMessage(data, message) {
    let binaryMessage = "";
    
    for (let i = 0; i < message.length; i++) {
        let binaryChar = message[i].charCodeAt(0).toString(2).padStart(8, "0");
        binaryMessage += binaryChar;
    }

    binaryMessage += "00000000"; // End marker

    if (binaryMessage.length > data.length / 4) {
        alert("Message is too large for this image.");
        return;
    }

    for (let i = 0; i < binaryMessage.length; i++) {
        data[i * 4] = (data[i * 4] & 0xFE) | parseInt(binaryMessage[i], 2);
    }
}

// **DOWNLOAD ENCODED IMAGE**
function downloadEncodedImage() {
    let link = document.createElement("a");
    link.download = "encoded_image.png";
    link.href = document.getElementById("encodedPreview").src;
    link.click();
}

// **DECODING FUNCTION**
function decodeMessageFromImage() {
    let fileInput = document.getElementById("decodeFile");
    let password = document.getElementById("password2").value;
    let decodedMessageContainer = document.getElementById("revealedMessage");

    if (!fileInput.files.length) {
        alert("Please select an image file.");
        return;
    }

    let file = fileInput.files[0];
    let reader = new FileReader();

    reader.onload = function (event) {
        let img = new Image();
        img.src = event.target.result;

        img.onload = function () {
            try {
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let message = extractHiddenMessage(imageData);

                if (!message) {
                    alert("No hidden message found in the image.");
                    return;
                }

                let decryptedMessage = message;
                if (password) {
                    try {
                        decryptedMessage = sjcl.decrypt(password, message);
                    } catch (error) {
                        alert("Invalid password or corrupted data.");
                        return;
                    }
                }

                decodedMessageContainer.textContent = decryptedMessage;
            } catch (error) {
                alert("An error occurred while decoding the image.");
                console.error(error);
            }
        };
    };

    reader.readAsDataURL(file);
}

// **EXTRACT MESSAGE FROM IMAGE**
function extractHiddenMessage(imageData) {
    let binaryString = "";
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        binaryString += (data[i] & 1).toString();
    }

    const byteArray = binaryString.match(/.{8}/g);
    if (!byteArray) return "";

    let message = byteArray.map(byte => String.fromCharCode(parseInt(byte, 2))).join("");
    return message.split("\x00")[0]; // Stop at null terminator
}
