let connection;
// Safer detection of number of slides: guard against missing or changed DOM
let numSlides = NaN;
try {
    const pageLabelEl = document.getElementsByClassName("page-label")[0];
    if (pageLabelEl && pageLabelEl.innerText) {
        const match = pageLabelEl.innerText.match(/(\d+)/);
        if (match) numSlides = parseInt(match[1], 10);
    }
} catch (e) {
    console.error('Error parsing page-label for numSlides', e);
}

// Fallbacks: try data attributes or other heuristics
if (!numSlides || isNaN(numSlides)) {
    try {
        const alt = document.querySelector('[data-total-pages]');
        if (alt) numSlides = parseInt(alt.getAttribute('data-total-pages'), 10);
    } catch (e) {
        // ignore
    }
}

let baseUrl = window.location.href;
let metadataEndpoint = baseUrl.charAt(baseUrl.length-1) == "/" ? baseUrl + "page_data/" : baseUrl + "/page_data/";
let slideImageUrls = [];

let slideDeckAlreadyDownloaded = false; //cannot download the slide deck more than once on the same session
let slideDeckGenerationInProgress = false;

let userIsAuthenticated = () => {
    //If prompt doesn't exist, user has entered their email address to access slide deck.
    if (document.getElementById("prompt") == null) {
        return true; 
    } else {
        return false;
    }
}

let getSlideImageUrls = async () => {
    if (!numSlides || isNaN(numSlides) || numSlides <= 0) {
        console.error('DocSend Downloader: could not detect number of slides. numSlides=', numSlides);
        showDefaultAlert('Could not detect number of slides on this DocSend page. The page structure may have changed.');
        return;
    }

    for (let i = 1; i <= numSlides; i++) {
        let url = metadataEndpoint + String(i);
        try {
            const response = await fetch(url, {credentials: 'same-origin'});
            if (!response.ok) {
                console.warn('Non-OK response fetching slide metadata', url, response.status);
                continue;
            }
            const data = await response.json();
            if (data) {
                // Prefer directImageUrl when available (more likely a direct signed URL)
                const img = data.directImageUrl || data.imageUrl || null;
                if (img) {
                    slideImageUrls.push(img);
                } else {
                    console.warn('Unexpected metadata format for', url, data);
                }
            } else {
                console.warn('Empty metadata response for', url);
            }
        } catch (e) {
            console.error('Error fetching slide metadata from', url, e);
        }
    }
}

let generateSlideDeckPdf = async () => {
    await getSlideImageUrls();
    if (!slideImageUrls || slideImageUrls.length === 0) {
        showDefaultAlert('Could not retrieve slide images. The DocSend layout or API may have changed or this deck requires additional access.');
        return;
    }
    buildPdf(slideImageUrls);
}

chrome.runtime.onConnect.addListener((port) => {
    connection = port;
    port.onMessage.addListener((message) => {
        if (userIsAuthenticated()) {
            if (message.requestType == "GENERATE_PDF") {
                slideDeckGenerationInProgress = true;
                slideDeckAlreadyDownloaded = true;
                showCustomAlert(`Generating slide deck as PDF: 0/${numSlides} slides complete...`);
                generateSlideDeckPdf();
            } 
            else if (message.requestType == "CHECK_PROGRESS") {
                if (slideDeckGenerationInProgress) {
                    showCustomAlert("Please wait. Still generating slide deck as PDF...");
                }
                else if (slideDeckAlreadyDownloaded) {
                    showDefaultAlert("Slide deck was already downloaded during this session. Please reload the page to download again.")
                } else {
                    showDefaultAlert("ERROR: Slide deck download progress unknown. Please try again.");
                }
            }
        } else {
            showDefaultAlert("You must be signed in to download this slide deck as a PDF.")
        }
    })
})


stream.on("finish", () => {
    slideDeckGenerationInProgress = false;
    let blobUrl = stream.toBlobURL('application/pdf');
    let totalTime = new Date().getTime() - startTime;
    initiateDownload(blobUrl);
    hideCustomAlert();
    showDefaultAlert("Done ! Slide deck PDF generated in " + String(totalTime) + " ms.");
    connection.postMessage({requestType: "SET_JOB_COMPLETE"});
})