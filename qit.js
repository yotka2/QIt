chrome.storage.sync.get(["noprompt_multiple", "JRHC_mode"], function(data) {
// Todo: does 1273 always work?
var max_qr_chars = 800;

// Todo: Consts
var colorLight = "#f0f8ff";
var colorDark = "#000000";
var arrow_to_text_margin_px = 40;
var min_margin_top_px = 5;
var max_qr_size_px = 300;

function get_bounding_rect(selection_element) {
    // Bounding box of the first row
    var rect = selection_element.getRangeAt(0).getClientRects()[0];
    // If it's not defined (in some non-regular selection cases), than use the base node's box
    if (!rect) {
        rect = selection_element.baseNode.getClientRects()[0];
    }

    return rect;
}

function create_tooltip_div(arrow_on_top) {
    var tooltip_div = document.createElement("div");
    tooltip_div.style.backgroundColor = colorLight;
    tooltip_div.style.border = "1px solid " + colorDark;
    tooltip_div.style.padding = "5px";
    tooltip_div.style.borderRadius = "10px";
    tooltip_div.style.position = "absolute";
    tooltip_div.style.zIndex = "9999";
    tooltip_div.style.direction = "ltr";

    var contentDiv = document.createElement("div");
    tooltip_div.appendChild(contentDiv);

    var arrow = document.createElement("div");
    arrow.style.position = "absolute";
    arrow.style.left = "15px";
    arrow.style.border = "solid transparent";
    if (arrow_on_top) {
        arrow.style.top = "-39px";
        arrow.style.borderBottomColor = colorLight;
    } else {
        arrow.style.bottom = "-39px";
        arrow.style.borderTopColor = colorLight;
    }
    arrow.style.borderWidth = "20px";
    arrow.style.zIndex = 9998;
    tooltip_div.appendChild(arrow);

    var borderArrow = document.createElement("div");
    borderArrow.style.position = "absolute";
    borderArrow.style.left = "15px";
    borderArrow.style.border = "solid transparent";
    if (arrow_on_top) {
        borderArrow.style.top = "-40px";
        borderArrow.style.borderBottomColor = colorDark;
    } else {
        borderArrow.style.bottom = "-40px";
        borderArrow.style.borderTopColor = colorDark;
    }
    borderArrow.style.borderWidth = "20px";
    borderArrow.style.zIndex = 9997;
    tooltip_div.appendChild(borderArrow);
    
    return tooltip_div;
}

function delete_div_on_outside_click(div) {
    function deleteDiv(event) {
        var clickedElement = event.target;
        // If the clicked element is not a child of the div
        while (clickedElement !== null) {
            if (clickedElement === div) {
                return;
            }
            clickedElement = clickedElement.parentElement;
        }
        div.remove();

        document.removeEventListener("click", deleteDiv);
        document.removeEventListener("contextmenu", deleteDiv);
    }

    // Delete the div when anything else will be clicked
    document.addEventListener("click", deleteDiv);
    document.addEventListener("contextmenu", deleteDiv);
}

function get_utf_str_length(str) {
    return (new TextEncoder().encode(str)).length
}

function get_max_utf_substring(str, max_len) {
    var utf_len = 0;

    for (var i = 0; i < str.length; i++) {
        var current_len = get_utf_str_length(str[i]);
        if (utf_len + current_len > max_len) {
            return i;
        }
        utf_len += current_len;
    }

    return str.length;
}

function create_qrcode(child, json) {
    correctLevel = QRCode.CorrectLevel.H;
    var qr_text_utf_length = get_utf_str_length(json.text);

    // qrcode.js has a bug with CorrectLevel.H with strings between 195 and 220 characters
    // https://stackoverflow.com/questions/30796584/qrcode-js-error-code-length-overflow-17161056
    // Todo - fix
    if (qr_text_utf_length >= 195 && qr_text_utf_length <= 220) {
        correctLevel = QRCode.CorrectLevel.Q;
    }

    json.correctLevel = correctLevel;
    return new QRCode(child, json);
}

function text_to_JRHC_format(text) {
    return text.replace('\n', '\r\n');
}

var selection_element = window.getSelection();
var selection_text = selection_element.toString();

if (data.JRHC_mode) {
    selection_text = text_to_JRHC_format(selection_text);
}

if (get_utf_str_length(selection_text) < max_qr_chars) {
    // Todo: smarter size according to text length
    var qr_svg_size_px = 64 + selection_text.length;
    if (qr_svg_size_px > max_qr_size_px) {
        qr_svg_size_px = max_qr_size_px;
    }

    var rect = get_bounding_rect(selection_element);

    var tooltip_on_top = false;
    if (rect.top > qr_svg_size_px + arrow_to_text_margin_px + min_margin_top_px) {
        tooltip_on_top = true;
    }
    var QRDiv = create_tooltip_div(!tooltip_on_top);

    // Todo: Is there a less ugly way?
    create_qrcode(QRDiv.children[0], { text: selection_text, colorDark : colorDark, colorLight : colorLight, useSVG: true });
    var QRSvg = QRDiv.children[0].children[0];
    QRSvg.setAttribute("shape-rendering", "crispEdges");
    QRSvg.style.width = qr_svg_size_px + "px";
    QRSvg.style.height = qr_svg_size_px + "px";
    QRSvg.style.display = "block";

    QRDiv.style.left = rect.left - 15 + "px";
    if (tooltip_on_top) {
        QRDiv.style.top = (rect.top + window.scrollY - QRDiv.offsetHeight - qr_svg_size_px - arrow_to_text_margin_px) + "px";
    } else {
        QRDiv.style.top = (rect.top + window.scrollY - QRDiv.offsetHeight + arrow_to_text_margin_px) + "px";
    }

    document.body.appendChild(QRDiv);

    delete_div_on_outside_click(QRDiv);
} else {
    var rect = get_bounding_rect(selection_element);

    var tooltip_on_top = false;
    if (rect.top > arrow_to_text_margin_px + min_margin_top_px) {
        tooltip_on_top = true;
    }
    var linkDiv = create_tooltip_div(!tooltip_on_top);
    linkDiv.children[0].style.color = colorDark;

    linkDiv.style.left = rect.left - 15 + "px";
    if (tooltip_on_top) {
        linkDiv.style.top = (rect.top + window.scrollY - linkDiv.offsetHeight - arrow_to_text_margin_px) + "px";
    } else {
        linkDiv.style.top = (rect.top + window.scrollY - linkDiv.offsetHeight + arrow_to_text_margin_px) + "px";
    }

    function openQRWindow() {
        // Todo - modify the qrcode library so this div isn't needed
        var tmp_qr_div = document.createElement("div");

        var previous_linkdiv_height = linkDiv.clientHeight;

        linkDiv.children[0].innerHTML = "Generating QRs...";

        var progressBar = document.createElement("div");
        progressBar.style.width = '0%';
        progressBar.style.height = '20px';
        progressBar.style.backgroundColor = '#4CAF50';
        progressBar.style.borderRadius = '5px';

        var progressBarContainer = document.createElement("div");
        progressBarContainer.style.width = '100%';
        progressBarContainer.style.height = '20px';
        progressBarContainer.style.backgroundColor = '#ccc';
        progressBarContainer.style.borderRadius = '5px';

        progressBarContainer.appendChild(progressBar);
        linkDiv.children[0].appendChild(progressBarContainer);

        if (tooltip_on_top) {
            linkDiv.style.top = parseInt(linkDiv.style.top, 10) + previous_linkdiv_height - linkDiv.clientHeight + "px";
        }

        var jsons = [];

        var steps = 0;
        var text_left = selection_text;
        while (text_left) {
            var index = get_max_utf_substring(text_left, max_qr_chars);
            text_left = text_left.substring(index, text_left.length);
            steps += 1;
        }

        var current_steps = 0;
        var progressBarWidth = 0;
        text_left = selection_text;

        function create_next_qr() {
            var index = get_max_utf_substring(text_left, max_qr_chars);
            var qr_text = text_left.substring(0, index);

            current_steps++;
            console.log("Step " + current_steps + " out of " + steps + ": QR of " + qr_text.length + " chars (" + get_utf_str_length(qr_text) + " UTF)");
            progressBarWidth = (current_steps / steps) * 100;
            progressBar.style.width = progressBarWidth + '%';

            setTimeout(function() {
                var qrcode = create_qrcode(tmp_qr_div, { text: qr_text });
                var qr_img = qrcode._oDrawing._elCanvas.toDataURL("image/png");
                jsons.push({text: qr_text, src: qr_img});

                text_left = text_left.substring(index, text_left.length);

                if (text_left) {
                    create_next_qr();
                } else {
                    chrome.runtime.sendMessage({jsons: jsons});
                }
            }, 5);
        }
        create_next_qr();
    }

    if (data.noprompt_multiple) {
        document.body.appendChild(linkDiv);
        openQRWindow();
    } else {
        linkDiv.children[0].innerHTML = "Text too long for a single QR Code. Click here to open all QRs in a new tab";
        linkDiv.onclick = openQRWindow;
        document.body.appendChild(linkDiv);
    }

    delete_div_on_outside_click(linkDiv);
}
});
