import fs from "node:fs";
import path from "node:path";

const solc = require("solc") as { compile(input: string): string };

const root = process.cwd();
const contractsDir = path.join(root, "contracts");
const artifactsDir = path.join(root, "artifacts", "contracts");

function collectSolidityFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectSolidityFiles(fullPath);
    }
    return entry.name.endsWith(".sol") ? [fullPath] : [];
  });
}

function toSourceName(filePath: string): string {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

const sources = Object.fromEntries(
  collectSolidityFiles(contractsDir).map((filePath) => [
    toSourceName(filePath),
    { content: fs.readFileSync(filePath, "utf8") },
  ]),
);

const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode", "evm.deployedBytecode"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = output.errors ?? [];
const fatalErrors = errors.filter((error: { severity: string }) => error.severity === "error");

for (const error of errors) {
  console.log(error.formattedMessage);
}

if (fatalErrors.length > 0) {
  process.exitCode = 1;
  throw new Error("Solidity compilation failed.");
}

fs.rmSync(path.join(root, "artifacts"), { recursive: true, force: true });

for (const [sourceName, contracts] of Object.entries(output.contracts) as [
  string,
  Record<string, { abi: unknown[]; evm: { bytecode: { object: string }; deployedBytecode: { object: string } } }>,
][]) {
  for (const [contractName, contractOutput] of Object.entries(contracts)) {
    const artifact = {
      _format: "hh-sol-artifact-1",
      contractName,
      sourceName,
      abi: contractOutput.abi,
      bytecode: `0x${contractOutput.evm.bytecode.object}`,
      deployedBytecode: `0x${contractOutput.evm.deployedBytecode.object}`,
      linkReferences: {},
      deployedLinkReferences: {},
    };

    const outputDir = path.join(artifactsDir, path.dirname(sourceName).replace(/^contracts[\\/]/, ""));
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, `${contractName}.json`), JSON.stringify(artifact, null, 2));
  }
}

console.log("Compiled contracts with local solc.");
