import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs";

export const guessVsCodeUserDataDir = (): string => {
  const home = os.homedir();
  const appData = process.env.APPDATA; // C:\Users\...\AppData\Roaming
  const exeName = process.env.VSCODE_PORTABLE ? "Code - Portable" : "Code";

  // 1) if VS Code was launched with --user-data-dir, it sets VSCODE_PORTABLE or you know the path,
  //    but from *outside* VS Code we have to guess.
  // 2) Roaming is the official user-data location on Windows. :contentReference[oaicite:0]{index=0}

  const candidates = [
    // Windows – stable / insiders / OSS
    appData && path.join(appData, "Code", "User"),
    appData && path.join(appData, "Code - Insiders", "User"),
    appData && path.join(appData, "Code - OSS", "User"),
    // Portable zip w/ data\user-data (just in case) :contentReference[oaicite:1]{index=1}
    home && path.join(home, "vscode-portable", "data", "user-data", "User"),
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  // fallback
  return candidates[0]!;
};
