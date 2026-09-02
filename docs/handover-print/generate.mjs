import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { marked } from "marked"

const root = join(dirname(fileURLToPath(import.meta.url)), "../..")
const mdPath = join(root, "HANDOVER.md")
const outDir = dirname(fileURLToPath(import.meta.url))
const htmlPath = join(outDir, "handover.html")

marked.setOptions({ gfm: true, breaks: false })

const md = readFileSync(mdPath, "utf8").replace(
  /^# XYZ London — Project Handover\n\n/,
  ""
)

const body = marked.parse(md)
const generated = new Date().toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

const html = `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <title>XYZ London — Project Handover</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 15mm 18mm;
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      color: #141414;
      background: #fff;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .cover {
      page-break-after: always;
      min-height: 240mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 28mm 8mm 18mm;
    }

    .cover-rule {
      width: 48px;
      height: 3px;
      background: #E95420;
      margin: 0 0 28px;
    }

    .cover-kicker {
      font-size: 9pt;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: #6b6b6b;
      margin: 0 0 14px;
    }

    .cover h1 {
      font-size: 36pt;
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.05;
      margin: 0 0 16px;
      color: #0F0F0F;
    }

    .cover-sub {
      font-size: 13pt;
      color: #3a3a3a;
      max-width: 420px;
      line-height: 1.4;
      margin: 0;
    }

    .cover-meta {
      border-top: 1px solid #ddd;
      padding-top: 18px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 24px;
      font-size: 9pt;
      color: #555;
    }

    .cover-meta strong {
      display: block;
      color: #111;
      font-size: 8pt;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 4px;
      font-weight: 600;
    }

    .page {
      padding: 0 2mm;
    }

    h1, h2, h3, h4 {
      color: #0F0F0F;
      page-break-after: avoid;
      font-weight: 650;
    }

    h1 {
      font-size: 20pt;
      letter-spacing: -0.02em;
      margin: 0 0 10px;
    }

    h2 {
      font-size: 14pt;
      letter-spacing: -0.015em;
      margin: 20px 0 8px;
      padding-top: 12px;
      border-top: 1.5px solid #0F0F0F;
      page-break-before: auto;
    }

    h3 {
      font-size: 11.5pt;
      margin: 16px 0 6px;
    }

    h4 {
      font-size: 10.5pt;
      margin: 12px 0 4px;
    }

    p { margin: 0 0 8px; }

    a { color: #1a1a1a; text-decoration: underline; text-underline-offset: 2px; }

    ul, ol { margin: 0 0 10px; padding-left: 18px; }
    li { margin-bottom: 3px; }

    hr {
      border: 0;
      border-top: 1px solid #ddd;
      margin: 14px 0;
    }

    code {
      font-family: "SF Mono", Menlo, Monaco, Consolas, monospace;
      font-size: 8.4pt;
      background: #f3f3f3;
      padding: 1px 4px;
      border-radius: 2px;
    }

    pre {
      background: #f4f4f4;
      border: 1px solid #e4e4e4;
      padding: 10px 12px;
      overflow: hidden;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 7.8pt;
      line-height: 1.4;
      page-break-inside: avoid;
      margin: 0 0 12px;
    }

    pre code {
      background: none;
      padding: 0;
      font-size: inherit;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 12px;
      font-size: 8.6pt;
      page-break-inside: auto;
    }

    thead { display: table-header-group; }

    th, td {
      border: 1px solid #d8d8d8;
      padding: 5px 7px;
      vertical-align: top;
      text-align: left;
      word-break: break-word;
    }

    th {
      background: #0F0F0F;
      color: #fff;
      font-weight: 600;
      font-size: 8pt;
      letter-spacing: 0.02em;
    }

    tr { page-break-inside: avoid; }
    tr:nth-child(even) td { background: #fafafa; }

    blockquote {
      margin: 0 0 10px;
      padding: 6px 12px;
      border-left: 3px solid #E95420;
      background: #faf7f5;
      color: #333;
    }

    .toc-note {
      font-size: 9pt;
      color: #555;
      margin-bottom: 16px;
    }

    .footer-note {
      margin-top: 28px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      font-size: 8.5pt;
      color: #666;
    }
  </style>
</head>
<body>
  <section class="cover">
    <div>
      <div class="cover-rule"></div>
      <p class="cover-kicker">Confidential handover</p>
      <h1>XYZ London<br/>Project Handover</h1>
      <p class="cover-sub">Architecture, operations, and developer notes for the MedusaJS store, Next.js storefront, and Sanity CMS.</p>
    </div>
    <div class="cover-meta">
      <div>
        <strong>Prepared for</strong>
        Client and incoming developer
      </div>
      <div>
        <strong>Date</strong>
        ${generated}
      </div>
      <div>
        <strong>Stack</strong>
        Medusa 2.15 · Next.js 15 · Sanity 3
      </div>
      <div>
        <strong>Source</strong>
        HANDOVER.md in the project repository
      </div>
    </div>
  </section>
  <main class="page">
    ${body}
    <p class="footer-note">This PDF is generated from HANDOVER.md. Prefer the markdown file in the repository when copying commands. Do not commit secrets into either document.</p>
  </main>
</body>
</html>
`

mkdirSync(outDir, { recursive: true })
writeFileSync(htmlPath, html)
console.log(`Wrote ${htmlPath}`)
