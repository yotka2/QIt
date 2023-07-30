document.addEventListener("DOMContentLoaded", function() {
    window.opener.postMessage('childReady', '*');

    var QRTextDiv = document.getElementById("QRText");
    
    var QRContainerDiv = document.getElementById("qr-container");

    window.addEventListener('message', receiveMessage);

    function receiveMessage(event) {
        if (event.source !== window.opener) {
            console.warn('Received message from an unknown source.');
            return;
        }

        // Access the data sent from the parent window
        var json = JSON.parse(event.data);
        var jsons = json.jsons;

        var full_text = "";

        for (i = 0; i < jsons.length; i++) {
            img_src = jsons[i].src;

            var image_box = document.createElement('div');
            image_box.classList.add("image-box");

            var label = document.createElement('label');
            label.innerText = "QR #" + (i + 1);

            image_box.appendChild(label);

            var qr_code_div = document.createElement('div');
            qr_code_div.classList.add("qr-code");

            var img = document.createElement('img');
            img.src = img_src;
            image_box.title = jsons[i].text;
            img.width = 256;
            img.height = 256;

            qr_code_div.appendChild(img);

            var back_content = document.createElement('div');
            back_content.classList.add("back-content");
            back_content.innerText = "QR #" + (i + 1) + " is hidden"

            qr_code_div.appendChild(back_content);

            image_box.appendChild(qr_code_div);

            qr_code_div.addEventListener("click", function() {
                this.classList.toggle("flipped");
            });

            QRContainerDiv.appendChild(image_box);

            full_text += jsons[i].text;
        }

        QRTextDiv.innerText = full_text;

        var WaitingQRsDiv = document.getElementById("wait-qrs");
        WaitingQRsDiv.remove();
        var QRContentDiv = document.getElementById("qr-content");
        QRContentDiv.style.visibility = "visible";
    }
    
    const flipAllButton = document.querySelector(".flip-all-button");

    flipAllButton.addEventListener("click", function() {
        const qrCodes = document.querySelectorAll(".qr-code");
        qrCodes.forEach((qrCode) => {
        qrCode.classList.toggle("flipped");
        });
    });

});