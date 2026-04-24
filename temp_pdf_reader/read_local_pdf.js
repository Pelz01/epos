const fs = require('fs');
const pdf = require('pdf-parse');

async function main() {
    try {
        const filePath = "C:\\Users\\faley\\Downloads\\Epos_Product_Brief.pdf";
        const dataBuffer = fs.readFileSync(filePath);
        
        const data = await pdf(dataBuffer);
        console.log("--- PDF TEXT START ---");
        console.log(data.text);
        console.log("--- PDF TEXT END ---");
    } catch (e) {
        console.error("Error reading PDF:", e);
    }
}
main();
