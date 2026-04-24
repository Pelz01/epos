const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
    console.log("--- PDF TEXT START ---");
    console.log(pdfParser.getRawTextContent());
    console.log("--- PDF TEXT END ---");
});

pdfParser.loadPDF("C:\\Users\\faley\\Downloads\\Epos_Product_Brief.pdf");
