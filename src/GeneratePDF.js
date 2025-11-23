let startTime;
let numSlidesComplete = 0;
const doc = new PDFDocument({layout:'landscape', margin: 0, autoFirstPage: false});
const stream = doc.pipe(blobStream());

const getImageAsBlob = async (url) => {
    try {
        const response = await fetch(url, {credentials: 'same-origin'});
        if (!response.ok) {
            throw new Error(`Image fetch failed: ${response.status} ${response.statusText}`);
        }
        numSlidesComplete++;
        showCustomAlert(`Generating slide deck as PDF: ${numSlidesComplete}/${numSlides} slides complete...`);
        const blob = await response.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error('Error fetching slide deck image', url, e);
        throw e; // rethrow so caller knows this slide failed
    }
}

const addSlidesToPDF = async (imageUrls) =>{
    for (let i=0; i<imageUrls.length; i++) {
        await getImageAsBlob(imageUrls[i]).then(data => {
            const img = doc.openImage(data);
            doc.addPage({size: [img.width, img.height]});
            doc.image(img, 0, 0);
        
        })    
    }
}

const buildPdf = async (imageUrls) => {
    startTime = new Date().getTime();
    await addSlidesToPDF(imageUrls);
    doc.end();
}