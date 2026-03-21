const puppeteer =
require("puppeteer-core");

const chromium = require("@sparticuz/chromium");

exports.generatePDF =
async(html)=>{

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

const page =
await browser.newPage();

await page.setContent(html,{

waitUntil:"networkidle0"

});

const pdf =
await page.pdf({

format:"A4",

printBackground:true,

margin:{

top:"20px",

bottom:"20px",

left:"20px",

right:"20px"

}

});

await browser.close();

return pdf;

};