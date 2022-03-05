import * as yargs from 'yargs'
import { exec } from 'child_process'

const choices = ['apollo', 'artemis', 'poseidon', 'ares', 'zeus']
const agrv = yargs.options({
  b: { type: 'array', choices, required: true, default: choices },
  i: { type: 'boolean', default: false },
  s: { type: 'array', choices, required: false, default: [] },
}).argv

let command: string = ''

if ('then' in agrv) {
  yargs.exit(1, new Error('Script failed'))
} else {
  const blocks = agrv.b.filter(
    (choice) => !(agrv.s as string[]).includes(choice),
  )

  if (agrv.i) {
    command =
      'concurrently ' +
      blocks.map((choice) => `"cd ${choice} && yarn"`).join(' ')
  } else {
    command =
      'concurrently -k ' +
      blocks.map((choice) => `"cd ${choice} && yarn dev"`).join(' ')
  }

  command += ' --names ' + blocks.join(',')

  console.log(command)
}

const concurrentProc = exec(command, () => {})
concurrentProc?.stdout?.pipe(process.stdout)
