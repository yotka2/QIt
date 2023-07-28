var max_qr_chars = 1273;

// Todo: Consts
var colorLight = "#f0f8ff";
var colorDark = "#000000";
var arrow_to_text_margin_px = 40;
var min_margin_top_px = 5;
var max_qr_size_px = 480; // Something something assume ~1000px screen height

var selection_element = window.getSelection();
var selection_text = selection_element.toString();

if (selection_text.length < max_qr_chars) {
    // Todo: smarter size according to text length
    var qr_svg_size_px = 64 + selection_text.length;
    if (qr_svg_size_px > max_qr_size_px) {
        qr_svg_size_px = max_qr_size_px;
    }

    // Bounding box of the first row
    var rect = selection_element.getRangeAt(0).getClientRects()[0];
    // If it's not defined (in some non-regular selection cases), than use the base node's box
    if (!rect) {
        rect = selection_element.baseNode.getClientRects()[0];
    }

    var QRDiv = document.createElement("div");

    // Todo: Is there a less ugly way?
    new QRCode(QRDiv, { text: selection_text, colorDark : colorDark, colorLight : colorLight, useSVG: true });
    var QRSvg = QRDiv.children[0];

    QRSvg.setAttribute("shape-rendering", "crispEdges");
    // Todo: variable size according to length
    QRSvg.style.width = qr_svg_size_px + "px";
    QRSvg.style.height = qr_svg_size_px + "px";
    QRSvg.style.display = "block";

    QRDiv.style.backgroundColor = colorLight;
    QRDiv.style.border = "1px solid " + colorDark;
    QRDiv.style.padding = "5px";
    QRDiv.style.borderRadius = "10px";
    QRDiv.style.position = "absolute";
    QRDiv.style.zIndex = "9999";

    if (rect.top > qr_svg_size_px + arrow_to_text_margin_px + min_margin_top_px) {
        QRDiv.style.top = (rect.top + window.scrollY - QRDiv.offsetHeight - qr_svg_size_px - arrow_to_text_margin_px) + "px";
        QRDiv.style.left = rect.left - 15 + "px";

        // Create the pointing arrow in the bottom left
        // To create the illusion of border create a big dark one and a smaller light one on top
        var arrow = document.createElement("div");
        arrow.style.position = "absolute";
        arrow.style.bottom = "-39px";
        arrow.style.left = "15px";
        arrow.style.border = "solid transparent";
        arrow.style.borderTopColor = colorLight;
        arrow.style.borderWidth = "20px";
        arrow.style.zIndex = 9998;
        QRDiv.appendChild(arrow);

        var borderArrow = document.createElement("div");
        borderArrow.style.position = "absolute";
        borderArrow.style.bottom = "-40px";
        borderArrow.style.left = "15px";
        borderArrow.style.border = "solid transparent";
        borderArrow.style.borderTopColor = colorDark;
        borderArrow.style.borderWidth = "20px";
        borderArrow.style.zIndex = 9997;
        QRDiv.appendChild(borderArrow);
    } else {
        QRDiv.style.top = (rect.top + window.scrollY - QRDiv.offsetHeight + arrow_to_text_margin_px) + "px";
        QRDiv.style.left = rect.left - 15 + "px";

        // Create the pointing arrow in the top left
        // To create the illusion of border create a big dark one and a smaller light one on top
        var arrow = document.createElement("div");
        arrow.style.position = "absolute";
        arrow.style.top = "-39px";
        arrow.style.left = "15px";
        arrow.style.border = "solid transparent";
        arrow.style.borderBottomColor = colorLight;
        arrow.style.borderWidth = "20px";
        arrow.style.zIndex = 9998;
        QRDiv.appendChild(arrow);

        var borderArrow = document.createElement("div");
        borderArrow.style.position = "absolute";
        borderArrow.style.top = "-40px";
        borderArrow.style.left = "15px";
        borderArrow.style.border = "solid transparent";
        borderArrow.style.borderBottomColor = colorDark;
        borderArrow.style.borderWidth = "20px";
        borderArrow.style.zIndex = 9997;
        QRDiv.appendChild(borderArrow);
    }

    document.body.appendChild(QRDiv);

    // Delete the div when anything else will be clicked
    document.addEventListener("click", function(event) {
        var clickedElement = event.target;
        // If the clicked element is not a child of the div
        while (clickedElement !== null) {
            if (clickedElement === QRDiv) {
                return;
            }
            clickedElement = clickedElement.parentElement;
        }
        QRDiv.remove();
    });
} else {
    // Todo: Create link to a multi-qr window
    console.log("Couldn't create a QR code from " + selection_text.length + " characters");
}