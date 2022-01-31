import * as yargs from "yargs";
import { exec } from "child_process";

const choices = ["apollo", "artemis", "poseidon"];
const agrv = yargs.options({
  block: { type: "array", choices, required: true, default: choices },
  init: { type: "boolean", default: false },
}).argv;

let command: string = "";
if ("then" in agrv) {
  yargs.exit(1, new Error("Script failed"));
} else {
  if (agrv.init) {
    command =
      "concurrently " +
      agrv.block.map((choice) => `"cd ${choice} && yarn"`).join(" ");
  } else {
    command =
      "concurrently -k " +
      agrv.block.map((choice) => `"cd ${choice} && yarn dev"`).join(" ");
  }
}

const concurrentProc = exec(command, () => {});
concurrentProc?.stdout?.pipe(process.stdout);
