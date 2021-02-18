// @ts-ignore
import { getSdk } from "@balena/jellyfish-client-sdk";
// @ts-ignore
import * as spawn from "@ahmadnassri/spawn-promise";
import * as fs from "fs";
// Reflector will pull the code, run versionbot on it, and create `${type}-source` contract

interface Contract {
  type: string;
  id: string;
  version?: string;
}

interface Credentials {
  username: string;
  token: string;
}

const REGISTRY_URL = process.env.REGISTRY_URL ?? "registry.ly.fish.local";
const API_URL = process.env.API_URL ?? "http://api.ly.fish.local";
const REFLECTED_TYPE = "service-source";

const sdk = getSdk({
  apiUrl: API_URL,
  apiPrefix: "api/v2",
});

// Next transformer is converting from 'type': 'source' to some of the supported types to process the source
// The transformer will try to deduce what the target type is, such as `service-source`, `node-module-source`, etc.
// const sourceTransformer = () => {};

const createContract = async (credentials: Credentials) => {
  console.log("Authenticating with JF API");
  await sdk.setAuthToken(credentials.token);
  // const user = await this.sdk.auth.whoami

  console.log("Creating service source contract");

  // TODO: This shouldn't be part of this tool, just for testing purposes.
  try {
    const serviceSourceType = await sdk.card.get("service-source");
    if (!serviceSourceType) {
      await sdk.card.create({
        slug: "service-source",
        name: "Service source",
        type: "type@1.0.0",
        data: {
          schema: {
            type: "object",
            required: ["data"],
            properties: {
              data: {
                type: "object",
                required: ["$transformer"],
                properties: {
                  $transformer: {
                    type: "object",
                    required: ["artifactReady"],
                    properties: {
                      artifactReady: {
                        type: "boolean",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }
  } catch (err) {
    console.error(err);
  }

  const contract = {
    type: REFLECTED_TYPE,
    data: {
      $transformer: {
        artifactReady: false,
      },
    },
  };

  return await sdk.card.create(contract);
};

const runOrasCommand = async (
  args: string[],
  opts: Credentials,
  spawnOptions: any = {}
) => {
  // if (isLocalRegistry(registryUrl)) {
  // this is a local name. therefore we allow http
  args.push("--plain-http");
  // } else {
  args.push("--username");
  args.push(opts.username);
  args.push("--password");
  args.push(opts.token);
  // }

  console.log(`Oras command: \n${args.concat(" ")}`);
  const streams = await spawn(`oras`, args, spawnOptions);
  const output = streams.stdout.toString("utf8");
  console.log(`Oras output: ${output}`);
  return output;
};

const logErrorAndThrow = (e: any) => {
  if (e.spawnargs) {
    console.error(e.spawnargs);
    console.error(e.stderr.toString("utf8"));
  } else {
    console.error(e);
  }
  throw e;
};

const pushArtifact = async (
  reference: string,
  artifactPath: string,
  credentials: Credentials
) => {
  console.log(`Pushing artifact ${reference}`);
  try {
    const artifacts = await fs.promises.readdir(artifactPath);
    const orasCmd = [`push`, `${REGISTRY_URL}/${reference}`, ...artifacts];
    await runOrasCommand(orasCmd, credentials, { cwd: artifactPath });
  } catch (e) {
    logErrorAndThrow(e);
  }
};

const markContractAsReady = async (contract: Contract) => {
  console.log("Marking contract as ready");
  await sdk.card.update(contract.id, REFLECTED_TYPE, [
    {
      op: "replace",
      path: "/data/$transformer/artifactReady",
      value: true,
    },
  ]);
};

const main = async (artifactPath: string, credentials: Credentials) => {
  const contract = await createContract(credentials);
  await pushArtifact(
    `${contract.slug}:${contract.version}`,
    artifactPath,
    credentials
  );
  await markContractAsReady(contract);
  console.log("DONE!");
};

const args = process.argv.slice(2);
main(args[0], { username: args[1], token: args[2] });
