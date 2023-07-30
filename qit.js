// Todo: Why doesn't 1273 always work?
var max_qr_chars = 1200;

// Todo: Consts
var colorLight = "#f0f8ff";
var colorDark = "#000000";
var arrow_to_text_margin_px = 40;
var min_margin_top_px = 5;
var max_qr_size_px = 480; // Something something assume ~1000px screen height

var selection_element = window.getSelection();
var selection_text = selection_element.toString();


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
    new QRCode(QRDiv.children[0], { text: selection_text, colorDark : colorDark, colorLight : colorLight, useSVG: true });
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

    linkDiv.children[0].innerHTML = "Text too long for a single QR Code. Click here to open all QRs in a new tab";
    linkDiv.children[0].style.color = colorDark;

    linkDiv.style.left = rect.left - 15 + "px";
    if (tooltip_on_top) {
        linkDiv.style.top = (rect.top + window.scrollY - linkDiv.offsetHeight - arrow_to_text_margin_px) + "px";
    } else {
        linkDiv.style.top = (rect.top + window.scrollY - linkDiv.offsetHeight + arrow_to_text_margin_px) + "px";
    }

    function openQRWindow() {
        var QRWindow = window.open(chrome.runtime.getURL("qr_list_page.html"));

        // Todo - modify the qrcode library so this div isn't needed
        var tmp_qr_div = document.createElement("div");


        // Todo - we need to wait properly for the QRWindow to load.
        // The previous method was for it to send us a message when it loads (using window.opener).
        // However, window.opener seems to be null when opened from some sites, even when specifying rel="opener".
        window.addEventListener('message', receiveMessage);

        function receiveMessage(event) {
            if (event.data == "childReady") {
                while (selection_text) {
                    var index = get_max_utf_substring(selection_text, max_qr_chars);
                    var qr_text = selection_text.substring(0, index);

                    var qrcode = new QRCode(tmp_qr_div, { text: qr_text });
                    var qr_img = qrcode._oDrawing._elCanvas.toDataURL("image/png");
                    QRWindow.postMessage(JSON.stringify({text: qr_text, src: qr_img}), '*');
                    // Todo - why are all messages sent at once?

                    selection_text = selection_text.substring(index, selection_text.length);
                }
            }
        }
    }

    linkDiv.onclick = openQRWindow;

    document.body.appendChild(linkDiv);

    delete_div_on_outside_click(linkDiv);
}