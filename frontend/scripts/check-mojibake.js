import { promises as fs } from "node:fs"
import path from "node:path"

const currentWorkingDirectory = globalThis.process.cwd()
const rootDir = path.resolve(currentWorkingDirectory, "src")
const extensions = new Set([".js", ".jsx", ".ts", ".tsx", ".css", ".md"])
const suspiciousTokens = ["â€”", "â€™", "â€œ", "â€", "Ã", "�"]

const findings = []

const shouldScan = (filePath) => extensions.has(path.extname(filePath).toLowerCase())

const walk = async (dirPath) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      await walk(absolutePath)
      continue
    }

    if (!shouldScan(absolutePath)) continue

    const content = await fs.readFile(absolutePath, "utf8")
    const lines = content.split(/\r?\n/)

    lines.forEach((line, index) => {
      const hasMojibakeToken = suspiciousTokens.some((token) => line.includes(token))
      const hasReplacementChar = line.includes("\uFFFD")

      if (!hasMojibakeToken && !hasReplacementChar) return

      findings.push({
        filePath: path.relative(currentWorkingDirectory, absolutePath),
        lineNumber: index + 1,
        line: line.trim(),
      })
    })
  }
}

const main = async () => {
  try {
    await walk(rootDir)
  } catch (error) {
    console.error("Failed to scan files for encoding artifacts.")
    console.error(error instanceof Error ? error.message : String(error))
    globalThis.process.exit(1)
  }

  if (findings.length === 0) {
    console.log("No mojibake artifacts detected.")
    return
  }

  console.error("Potential mojibake artifacts detected:")
  findings.forEach((finding) => {
    console.error(`${finding.filePath}:${finding.lineNumber} -> ${finding.line}`)
  })
  globalThis.process.exit(1)
}

await main()
