import { exec } from 'child_process'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

function run(command: string) {
  console.log(command)

  const concurrentProc = exec(command, () => {})
  concurrentProc?.stdout?.pipe(process.stdout)
}

const services = ['apollo', 'artemis', 'poseidon', 'ares', 'zeus']
yargs(hideBin(process.argv))
  .command(
    'add <service> <dependency..>',
    'Install dependencies',
    (y) => {
      return y
        .positional('service', {
          choices: services,
          demandOption: true,
        })
        .positional('dependency', {
          array: true,
          demandOption: true,
        })
        .options({
          D: {
            boolean: true,
            default: false,
            description: 'Add to devDependency',
          },
        })
    },
    (agrv) => {
      const command = `cd ${agrv.service} && yarn add${
        agrv.D ? ' -D ' : ' '
      }${agrv.dependency.join(' ')}`

      run(command)
    },
  )
  .command(
    'remove <service> <dependency..>',
    'Uninstall dependencies',
    (y) => {
      return y
        .positional('service', {
          choices: services,
          demandOption: true,
        })
        .positional('dependency', {
          array: true,
          demandOption: true,
        })
    },
    (agrv) => {
      const command = `cd ${agrv.service} && yarn remove ${agrv.dependency.join(
        ' ',
      )}`

      run(command)
    },
  )
  .command(
    'init [services..]',
    'Init dependencies at CRM services',
    (y) => {
      return y.positional('services', {
        choices: services,
        array: true,
        default: services,
        demandOption: false,
      })
    },
    (agrv) => {
      const command = `concurrently ${agrv.services
        .map((service) => `"cd ${service}" && yarn`)
        .join(' ')} --names ${agrv.services.join(',')}`

      run(command)
    },
  )
  .command(
    'dev [services..]',
    'Run CRM services in local environment, default to run all services',
    (y) => {
      return y
        .positional('services', {
          demandOption: false,
          default: services,
          choices: services,
          array: true,
        })
        .option('skip', {
          alias: 'S',
          type: 'string',
          array: true,
          choices: services,
          default: [],
          demandOption: false,
          description: 'CRM services to skip',
        })
    },
    (agrv) => {
      const servicesToRun = agrv.services.filter(
        (service) => !(agrv.skip as string[]).includes(service),
      )
      const command = `concurrently -k ${servicesToRun
        .map((service) => `"cd ${service} && yarn dev"`)
        .join(' ')} --names ${servicesToRun.join(',')}`

      run(command)
    },
  )
  .parse()
