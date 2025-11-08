import { runExport } from "./exporter/export.js"
const SOURCE_DIR = "./copilot.vault/copilot"
const DEST_DIR =
    "C:\\Users\\Greg\\AppData\\Roaming\\Code - Insiders\\User\\prompts"

async function run() {
    await runExport(SOURCE_DIR, DEST_DIR)
}
void run()
