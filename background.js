const extension_id = "QIt";

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: extension_id,
        title: "Generate QR Code",
        contexts: ["selection"],
    });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === extension_id) {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ['qrcode/qrcode.min.js'],
        }).then(
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ['qit.js'],
        }));
    }
});
