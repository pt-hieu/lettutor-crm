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
```bash
$ node ./script.js --help
script.js [command]

Commands:
  script.js add <service> <dependency..>    Install dependencies
  script.js remove <service>                Uninstall dependencies
  <dependency..>
  script.js localize <service>              Localize dependencies for a specific
                                            CRM service
  script.js build <service>                 Build CRM service
  script.js start <service>                 Start CRM service
  script.js dev [services..]                Run CRM services in local
                                            environment, default to run all
                                            services

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```
