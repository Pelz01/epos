const axios = require('axios');
const pdf = require('pdf-parse');

async function main() {
    try {
        const url = "https://drive.google.com/uc?export=download&id=1uignTLYso1XCd5PxVS_el_ydxpPABk0i";
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer'
        });
        
        // Ensure it's a Buffer
        const buffer = Buffer.from(response.data);
        
        // Try parsing
        const data = await pdf(buffer);
        console.log("--- PDF TEXT START ---");
        console.log(data.text);
        console.log("--- PDF TEXT END ---");
    } catch (e) {
        console.error("Error reading PDF:", e);
    }
}
main();
