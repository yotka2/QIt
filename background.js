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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // Todo - verify message origin
    if (request.jsons) {
        chrome.tabs.create({'url': chrome.runtime.getURL("qr_list_page.html") + '?data=' + encodeURIComponent(JSON.stringify(request))});
    }
});