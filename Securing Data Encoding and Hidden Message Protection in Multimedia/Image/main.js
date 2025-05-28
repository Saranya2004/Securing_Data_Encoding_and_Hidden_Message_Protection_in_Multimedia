// initialize
window.onload = function() {
    document.getElementById('encodeFile').addEventListener('change', loadImage);
    document.getElementById('encode').addEventListener('click', encode);
    document.getElementById('downloadEncoded').addEventListener('click', downloadEncodedImage);
    document.getElementById('decodeFile').addEventListener('change', loadDecodingImage);
    document.getElementById('decode').addEventListener('click', decode);
};

// Load image for encoding
var loadImage = function(e) {
    var reader = new FileReader();
    reader.onload = function(event) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.getElementById('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            document.getElementById('encodedPreview').src = canvas.toDataURL();
            document.getElementById('encodedPreview').style.display = 'block';
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
};

// Encode message into image
var encode = function() {
    var message = document.getElementById('message').value;
    var password = document.getElementById('password').value;
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    if (password.length > 0) {
        message = sjcl.encrypt(password, message);
    } else {
        message = JSON.stringify({'text': message});
    }

    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    encodeMessage(imgData.data, sjcl.hash.sha256.hash(password), message);
    ctx.putImageData(imgData, 0, 0);

    document.getElementById('encodedPreview').src = canvas.toDataURL();
};

// Download encoded image
var downloadEncodedImage = function() {
    var link = document.createElement('a');
    link.download = 'encoded_image.png';
    link.href = document.getElementById('encodedPreview').src;
    link.click();
};

// Load image for decoding
var loadDecodingImage = function(e) {
    var reader = new FileReader();
    reader.onload = function(event) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.getElementById('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
};

// Decode message from image
var decode = function() {
    var password = document.getElementById('password2').value;
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var message = decodeMessage(imgData.data, sjcl.hash.sha256.hash(password));

    var obj = null;
    try {
        obj = JSON.parse(message);
    } catch (e) {
        alert('Invalid password or no hidden message.');
        return;
    }

    if (obj.ct) {
        try {
            obj.text = sjcl.decrypt(password, message);
        } catch (e) {
            alert('Incorrect password.');
        }
    }
    document.getElementById('messageDecoded').innerHTML = obj.text;
};
