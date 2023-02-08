import { NextApiRequest, NextApiResponse } from "next";
import playwright from "playwright";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { url } = req;
  const browser = await playwright.chromium.launch({
    headless: true // setting this to true will not run the ui
  });

  if (!url) {
    res.status(400).json({ error: "no url provided" });
    return;
  }
  let slug = url.split(".com")[1];

  try {

    const page = await browser.newPage();
    await page.goto(`https://terminal.hackernoon.com${slug}`);

    await page.locator('pre').waitFor();

    let text = await page.$eval('pre', pretag => {
      return pretag.innerText;
    });

    await browser.close();

    text = text
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace(/(\r\t|\t|\r)/gm, "");

    res.status(200).json({ text });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }


}
