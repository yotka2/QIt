// Create a context menu item
chrome.contextMenus.create({
    id: "QIO",
    title: "Generate QR Code",
    contexts: ["selection"],
});

// Add a click event listener for the context menu item
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "QIO") {
        chrome.scripting.executeScript({
            target: {tabId: tab.id, allFrames: false},
            files: ['qr.js'],
        });
    }
});
