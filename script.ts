import deps from './deps.json'
import packageJson from './package.json'
import chalk from 'chalk'
import { exec } from 'child_process'
import fs from 'fs'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

function run(command: string) {
  const concurrentProc = exec(command, () => {})
  concurrentProc?.stdout?.pipe(process.stdout)
}

function capitalize(str: string) {
  return str.charAt(0).toLocaleUpperCase() + str.slice(1)
}

function keys<T = object>(o: T): Array<keyof T> {
  return Object.keys(o) as any
}

const services = ['apollo', 'artemis', 'poseidon', 'ares', 'zeus'] as const
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
            description: 'Add to devDependencies',
          },
        })
    },
    (agrv) => {
      const command = `yarn add${agrv.D ? ' -D ' : ' '}${agrv.dependency.join(
        ' ',
      )}`

      const depsToSave = { ...deps } as Record<
        typeof services[number],
        string[]
      >

      depsToSave[agrv.service] = depsToSave[agrv.service].concat(
        agrv.dependency as string[],
      )
      depsToSave[agrv.service] = [...new Set(depsToSave[agrv.service])]

      fs.writeFileSync('deps.json', JSON.stringify(depsToSave, undefined, 2))

      console.log(
        chalk.green(
          `\n[CRM] Adding ${chalk.bold(agrv.dependency.join(', '))} to ${
            agrv.D ? 'devDependencies' : 'dependencies'
          } of ${chalk.bold(capitalize(agrv.service))}\n`,
        ),
      )

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
      const command = `yarn remove ${agrv.dependency.join(' ')}`

      const depsToSave = { ...deps } as Record<
        typeof services[number],
        string[]
      >

      depsToSave[agrv.service] = depsToSave[agrv.service].filter(
        (deps) => !(agrv.dependency as string[]).includes(deps),
      )

      fs.writeFileSync('deps.json', JSON.stringify(depsToSave, undefined, 2))

      console.log(
        chalk.green(
          `\n[CRM] Removing ${chalk.bold(agrv.dependency.join(', '))} in ${
            agrv.D ? 'devDependencies' : 'dependencies'
          } of ${chalk.bold(capitalize(agrv.service))}\n`,
        ),
      )

      run(command)
    },
  )
  .command(
    'localize <service>',
    'Localize dependencies for a specific CRM service',
    (y) => {
      return y.positional('service', {
        choices: services,
        demandOption: true,
      })
    },
    (agrv) => {
      const depsToFilter = { ...deps } as Record<
        typeof services[number],
        string[]
      >

      const packageJsonToSave = { ...packageJson }
      keys(packageJsonToSave.dependencies).forEach((key) => {
        if (depsToFilter[agrv.service].includes(key)) return
        delete packageJsonToSave.dependencies[key]
      })

      keys(packageJsonToSave.devDependencies).forEach((key) => {
        if (depsToFilter[agrv.service].includes(key)) return
        delete packageJsonToSave.devDependencies[key]
      })

      console.log(
        chalk.green(
          `\n[CRM] Localizing dependencies in ${chalk.bold(
            capitalize(agrv.service),
          )}\n`,
        ),
      )

      fs.writeFileSync(
        'package.json',
        JSON.stringify(packageJsonToSave, undefined, 2),
      )
    },
  )
  .command(
    'build <service>',
    'Build CRM service',
    (y) => {
      return y
        .positional('service', {
          demandOption: true,
          choices: services,
        })
        .option('dev', {
          alias: 'D',
          boolean: true,
          defaul: false,
          demandOption: false,
          description: 'Build using dev environment',
        })
    },
    (agrv) => {
      const command = `cd ${agrv.service} && npm run build${
        agrv.dev ? ':dev' : ''
      }`

      console.log(
        chalk.green(
          `\n[CRM] Building ${capitalize(agrv.service)}${
            agrv.dev ? ' targeting dev environment' : ''
          }\n`,
        ),
      )

      run(command)
    },
  )
  .command(
    'start <service>',
    'Start CRM service',
    (y) => {
      return y
        .positional('service', {
          demandOption: true,
          choices: services,
        })
        .option('dev', {
          alias: 'D',
          boolean: true,
          defaul: false,
          demandOption: false,
          description: 'Start using dev environment',
        })
    },
    (agrv) => {
      const command = `cd ${agrv.service} && npm run start${
        agrv.dev ? ':dev' : ''
      }`

      console.log(
        chalk.green(
          `\n[CRM] Starting ${capitalize(agrv.service)}${
            agrv.dev ? ' targeting dev environment' : ''
          }\n`,
        ),
      )

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
        .map((service) => `"cd ${service} && npm run dev"`)
        .join(' ')} --names ${servicesToRun.join(',')}`

      console.log(
        chalk.green(
          `\n[CRM] Starting ${chalk.bold(
            servicesToRun.map((s) => capitalize(s)).join(', '),
          )}${
            agrv.skip.length
              ? `, skipping ${chalk.bold(
                  (agrv.skip as string[]).map((s) => capitalize(s)).join(', '),
                )}`
              : ''
          }\n`,
        ),
      )

      run(command)
    },
  )
  .parse()
