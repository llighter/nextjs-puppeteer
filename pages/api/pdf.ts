import { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";

export default async function POST(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Method Not Allowed" });
  }

  const { name, phone, birthdate } = await request.body;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(`
      <html>
          <head>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          </head>
          <body class="p-6">
              <h1 class="text-2xl font-bold mb-4">리포트</h1>
              <p class="mb-2"><span class="font-semibold">이름:</span> ${name}</p>
              <p class="mb-2"><span class="font-semibold">휴대폰번호:</span> ${phone}</p>
              <p class="mb-2"><span class="font-semibold">생년월일:</span> ${birthdate}</p>
          </body>
      </html>
  `);
    const pdf = await page.pdf({ format: "A4" });
    console.log(`Generated PDF size: ${pdf.length} bytes`);
    await browser.close();

    response.setHeader("Content-Type", "application/pdf");
    response.setHeader(
      "Content-Disposition",
      "attachment; filename=report.pdf"
    );
    response.status(200).end(pdf);
  } catch (error) {
    console.error("PDF 생성 중 오류 발생:", error);
    response.status(500).json({ message: "PDF 생성 중 오류가 발생했습니다." });
  }
}
