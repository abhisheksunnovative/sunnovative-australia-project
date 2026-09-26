const fs = require('fs');
const file = 'd:/sunnovative-australia-website/Website_Backend/src/utils/billParser.js';
let code = fs.readFileSync(file, 'utf8');

const targetPerformAdvancedOCR = `        const performAdvancedOCR = async (imageBuffer) => {
            isBlurry = await checkImageBlur(imageBuffer);
            
            const processedImageBuffer = await sharp(imageBuffer)
                .resize({ width: 2500, withoutEnlargement: true }) 
                .grayscale()
                .normalize()
                .linear(1.2, -(1.2 * 128) + 128)
                .sharpen({ sigma: 1, m1: 2, m2: 2, x1: 2, y2: 10, y3: 20 })
                .toBuffer();

            // English + Hindi for cross-validation
            const worker = await Tesseract.createWorker('eng+hin');
            
            // Tesseract table-aware extraction using word bounding boxes
            const { data } = await worker.recognize(processedImageBuffer);
            await worker.terminate();

            if (data && data.words) {
                const mappedWords = data.words.map(w => ({
                    text: w.text,
                    x: w.bbox.x0,
                    y: w.bbox.y0
                }));
                // Tesseract lines might drift, use yTolerance of ~15 pixels
                return reconstructTableLayout(mappedWords, 15);
            }
            return data.text;
        };`;

const newPerformAdvancedOCR = `        const performAdvancedOCR = async (imageBuffer, pageIndex = 0) => {
            isBlurry = await checkImageBlur(imageBuffer);
            
            const processedImageBuffer = await sharp(imageBuffer)
                .resize({ width: 2500, withoutEnlargement: true }) 
                .grayscale()
                .normalize()
                .linear(1.2, -(1.2 * 128) + 128)
                .sharpen({ sigma: 1, m1: 2, m2: 2, x1: 2, y2: 10, y3: 20 })
                .toBuffer();

            // English + Hindi for cross-validation
            const worker = await Tesseract.createWorker('eng+hin');
            
            // Tesseract table-aware extraction using word bounding boxes
            const { data } = await worker.recognize(processedImageBuffer);
            await worker.terminate();

            if (data && data.words) {
                const mappedWords = data.words.map(w => ({
                    text: w.text,
                    x: w.bbox.x0,
                    y: w.bbox.y0 + (pageIndex * 2000) // Offset Y by page index to prevent overlap
                }));
                globalWordsWithPositions.push(...mappedWords);
                // Tesseract lines might drift, use yTolerance of ~15 pixels
                return reconstructTableLayout(mappedWords, 15);
            }
            return data.text;
        };`;

code = code.replace(targetPerformAdvancedOCR, newPerformAdvancedOCR);

const targetPdfBlock = `        if (mimeType === 'application/pdf') {
            console.log(\`[BillParser] Detected PDF. Attempting Table-Aware digital text extraction...\`);
            
            const render_page = async (pageData) => {
                const textContent = await pageData.getTextContent({ normalizeWhitespace: true });
                const items = textContent.items.map(item => ({
                    text: item.str,
                    x: item.transform[4],
                    y: item.transform[5]
                }));
                // In PDFs, y is usually from bottom-left, so sorting y-descending works or ascending.
                // We'll multiply by -1 to reverse sort it top-to-bottom.
                const invertedItems = items.map(i => ({...i, y: -i.y}));
                return reconstructTableLayout(invertedItems, 3);
            };

            const pdfData = await pdfParse(fileBuffer, { pagerender: render_page });
            rawText = pdfData.text || "";

            if (rawText.replace(/\\s+/g, '').length < 50) {
                console.log(\`[BillParser] PDF text is too short. Scanned PDF fallback...\`);
                const pageImages = await convertScannedPdfToImages(fileBuffer);
                if (pageImages && pageImages.length > 0) {
                    const pagesToOCR = Math.min(pageImages.length, 2);
                    for (let i = 0; i < pagesToOCR; i++) {
                        const text = await performAdvancedOCR(pageImages[i]);
                        rawText += "\\n" + text;
                    }
                    usedOCR = true;
                } else {
                    throw new Error("Could not convert PDF to images for OCR fallback.");
                }
            } else {
                console.log(\`[BillParser] Table-Aware PDF extraction successful.\`);
            }
        } else if (mimeType.startsWith('image/')) {
            console.log(\`[BillParser] Detected Image. Starting Advanced Table-Aware OCR...\`);
            rawText = await performAdvancedOCR(fileBuffer);
            usedOCR = true;
        }`;

const newPdfBlock = `        if (mimeType === 'application/pdf') {
            console.log(\`[BillParser] Detected PDF. Attempting Table-Aware digital text extraction...\`);
            let pageIndex = 0;
            const render_page = async (pageData) => {
                const textContent = await pageData.getTextContent({ normalizeWhitespace: true });
                const items = textContent.items.map(item => ({
                    text: item.str,
                    x: item.transform[4],
                    y: item.transform[5]
                }));
                const invertedItems = items.map(i => ({...i, y: -i.y + (pageIndex * 2000)}));
                globalWordsWithPositions.push(...invertedItems);
                pageIndex++;
                return reconstructTableLayout(invertedItems, 3);
            };

            const pdfData = await pdfParse(fileBuffer, { pagerender: render_page });
            rawText = pdfData.text || "";

            if (rawText.replace(/\\s+/g, '').length < 50) {
                console.log(\`[BillParser] PDF text is too short. Scanned PDF fallback...\`);
                globalWordsWithPositions = []; // Reset if we fallback
                const pageImages = await convertScannedPdfToImages(fileBuffer);
                if (pageImages && pageImages.length > 0) {
                    const pagesToOCR = Math.min(pageImages.length, 2);
                    for (let i = 0; i < pagesToOCR; i++) {
                        const text = await performAdvancedOCR(pageImages[i], i);
                        rawText += "\\n" + text;
                    }
                    usedOCR = true;
                } else {
                    throw new Error("Could not convert PDF to images for OCR fallback.");
                }
            } else {
                console.log(\`[BillParser] Table-Aware PDF extraction successful.\`);
            }
        } else if (mimeType.startsWith('image/')) {
            console.log(\`[BillParser] Detected Image. Starting Advanced Table-Aware OCR...\`);
            rawText = await performAdvancedOCR(fileBuffer, 0);
            usedOCR = true;
        }`;

code = code.replace(targetPdfBlock, newPdfBlock);

const targetReturn = `        return { rawText, usedOCR, isBlurry };`;
const newReturn = `        return { rawText, usedOCR, isBlurry, wordsWithPositions: globalWordsWithPositions };`;
code = code.replace(targetReturn, newReturn);

const targetInit = `        let usedOCR = false;
        let isBlurry = false;`;
const newInit = `        let usedOCR = false;
        let isBlurry = false;
        let globalWordsWithPositions = [];`;
code = code.replace(targetInit, newInit);

fs.writeFileSync(file, code);
console.log("Updated billParser.js");
