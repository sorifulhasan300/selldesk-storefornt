import fs from "node:fs";
import path from "node:path";
import module from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import ts from "typescript";

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, "src");
const serverOnlyEmptyPath = path.join(
  projectRoot,
  "node_modules",
  "server-only",
  "empty.js",
);

function resolveTsFile(candidatePath) {
  const candidates = [
    candidatePath,
    `${candidatePath}.ts`,
    `${candidatePath}.tsx`,
    path.join(candidatePath, "index.ts"),
    path.join(candidatePath, "index.tsx"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

module.registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only" && fs.existsSync(serverOnlyEmptyPath)) {
      return {
        shortCircuit: true,
        url: pathToFileURL(serverOnlyEmptyPath).href,
      };
    }

    let targetPath = null;

    if (specifier.startsWith("@/")) {
      targetPath = resolveTsFile(path.join(srcRoot, specifier.slice(2)));
    } else if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      context.parentURL &&
      context.parentURL.startsWith("file:")
    ) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      targetPath = resolveTsFile(path.resolve(parentDir, specifier));
    }

    if (targetPath) {
      return {
        shortCircuit: true,
        url: pathToFileURL(targetPath).href,
      };
    }

    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (
      url.startsWith("file:") &&
      !url.includes("/node_modules/") &&
      (url.endsWith(".ts") || url.endsWith(".tsx"))
    ) {
      const filePath = fileURLToPath(url);
      const source = fs.readFileSync(filePath, "utf8");
      const { outputText } = ts.transpileModule(source, {
        fileName: filePath,
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
          verbatimModuleSyntax: false,
        },
      });
      return {
        shortCircuit: true,
        format: "commonjs",
        source: outputText,
      };
    }

    return nextLoad(url, context);
  },
});
