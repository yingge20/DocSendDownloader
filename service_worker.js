let connection;
let jobInProgress = false;
let jobComplete = false;

const scriptsToInject = [
    "./modules/pdfkit.js",
    "./modules/blob-stream.js",
    "./src/ModifyDocSendView.js",
    "./src/GeneratePDF.js",
    "./src/DocSendDownloader.js"
];

const executeJob = () => {
    jobInProgress = true;
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const currentTabId = tabs[0].id;
        const currentTabUrl = tabs[0].url;

        // SECURITY: Only allow execution on DocSend domains
        const allowedDomains = ['docsend.com', 'docsend.dropbox.com'];
        const isAllowedDomain = allowedDomains.some(domain => {
            try {
                const url = new URL(currentTabUrl);
                return url.hostname.endsWith(domain);
            } catch (e) {
                return false;
            }
        });

        if (!isAllowedDomain) {
            console.error('DocSend Downloader: This extension only works on DocSend pages');
            jobInProgress = false;
            return;
        }

        chrome.scripting
        .executeScript({
            target: {
                tabId: currentTabId,
            },
            files: scriptsToInject
        })
        .then(() => {
            connection = chrome.tabs.connect(currentTabId);
            connection.postMessage({requestType: "GENERATE_PDF"});
            connection.onMessage.addListener((message) => {
                if (message.requestType == "SET_JOB_COMPLETE") {
                    jobInProgress = false;
                    jobComplete = true;
                }
            })
        })
    })
}

chrome.action.onClicked.addListener(() => {
    if (jobComplete || jobInProgress) {
        try {
            connection.postMessage({requestType: "CHECK_PROGRESS"});
        } 
        catch {
            //Connection closed, start new job
            executeJob();
        }
    }
    else if (!jobInProgress && !jobComplete) {
        executeJob();
    }
})