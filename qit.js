// Todo: Why doesn't 1273 always work?
var max_qr_chars = 1100;

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

if (selection_text.length < max_qr_chars) {
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

    function deleteQRDiv(event) {
        var clickedElement = event.target;
        // If the clicked element is not a child of the div
        while (clickedElement !== null) {
            if (clickedElement === QRDiv) {
                return;
            }
            clickedElement = clickedElement.parentElement;
        }
        QRDiv.remove();
    }

    // Delete the div when anything else will be clicked
    document.addEventListener("click", deleteQRDiv);
    document.addEventListener("contextmenu", deleteQRDiv);
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
        var QRWindow = window.open();
        var QRDiv = QRWindow.document.createElement("div");

        var qr_text_array = [];

        for (var i = 0; i < selection_text.length; i += max_qr_chars) {
            var qr_text = selection_text.substring(i, i + max_qr_chars);

            new QRCode(QRDiv, { text: qr_text });
        }

        QRWindow.document.body.appendChild(QRDiv);
        img_array = QRWindow.document.getElementsByTagName('img')

        for (var i = 0; i < img_array.length; i++) {
            // Todo - doesn't work, why and how
            img_array[i].style.display = "inline";
            img_array[i].style.margin = "5px";
        }
    }

    linkDiv.onclick = openQRWindow;

    document.body.appendChild(linkDiv);

    function deletelinkDiv(event) {
        var clickedElement = event.target;
        // If the clicked element is not a child of the div
        while (clickedElement !== null) {
            if (clickedElement === linkDiv) {
                return;
            }
            clickedElement = clickedElement.parentElement;
        }
        linkDiv.remove();
    }

    // Delete the div when anything else will be clicked
    document.addEventListener("click", deletelinkDiv);
    document.addEventListener("contextmenu", deletelinkDiv);
}