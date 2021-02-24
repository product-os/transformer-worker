import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import path = require('path');
import * as util from 'util';
import * as YAML from 'yaml';

console.log("identity transformer CREATE starting");

const getEnvOrFail = (envVar: string) => {
  const env = process.env[envVar];
  if (!env) {
    console.log(`required env var ${envVar} was not set`)
    process.exit(1);
  }
  return env
}

// worker would expose this
const outputPath = getEnvOrFail('OUTPUT');
const inputPath = getEnvOrFail('INPUT');

const inDir = path.dirname(inputPath);
const outDir = path.dirname(outputPath);

if (!fs.existsSync(inDir)) {
  console.log("in-dir does not exist");
  process.exit(1);
}
if (!fs.existsSync(inputPath)) {
  console.log("in-path does not exist");
  process.exit(1);
}

type InContract = {
  slug: string
  type: "product-os.fake-input"
  version: string
  data: any
}

type OutContract = {
  slug: string
  type: "faq"
  name: string
  version: string
  data: any
}

// a general form of this would make sense in a "Transformers SDK"
type Input = {
  input: {
    contract: InContract,
    artifactPath: string // relative to the input file
  }
}
type Result = {
  results: Array<{
    contract: OutContract,
    artifactPath: string // relative to the results file
  }>
}

const run = async () => {
  const input = (await readInput(inputPath)).input;

  await fsExtra.copy(
    path.join(inDir, input.artifactPath),
    path.join(outDir, input.artifactPath),
    { recursive: true });

  const outContract = createImageContract(input.contract);

  const result: Result = {
    results: [
      {
        contract: outContract,
        artifactPath: input.artifactPath
      }
    ]
  }
  const writeFile = util.promisify(fs.writeFile)
  await writeFile(outputPath, JSON.stringify(result))
}

const readInput = async (path: string) => {
  const readFile = util.promisify(fs.readFile)
  return YAML.parse((await readFile(path)).toString()) as Input
}

const createImageContract = (inContract: InContract) => {
  const outContract: OutContract = {
    type: 'faq',
    slug: 'faq-result-from-'+inContract.slug+(new Date().getTime()),
    name: 'fantastic test result from '+new Date(),
    version: inContract.version,
    data: inContract.data,
  }
  return outContract
}

console.log("starting identity transformer");
run()
