# CRM System

[![Deployment](https://github.com/pt-hieu/lettutor-crm/actions/workflows/deploy.yaml/badge.svg)](https://github.com/pt-hieu/lettutor-crm/actions/workflows/deploy.yaml)

# Folder Structure

| Name     | Description |
| -------- | ----------- |
| apollo   | Backend     |
| artemis  | Frontend    |
| hades    | Migrate     |
| poseidon | CMS         |
| athena   | Terraform   |

# Script Instruction
> Run `yarn r` to start all the components in the codebase concurrently   
> Use flag `--init` to install dependencies instead of running in development environment   
> If you want to run some specific components, run `yarn r --block <component names>` .e.g `yarn r --block apollo artemis` to run only apollo and artemis in the concurrent mode

```bash
$ node ./script.js --block --help
Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --block[array] [required] [choices: "apollo", "artemis", "poseidon"] [default:
                                                ["apollo","artemis","poseidon"]]
  --init                                              [boolean] [default: false]
```
