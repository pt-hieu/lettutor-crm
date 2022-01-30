data "terraform_remote_state" "route_table" {
  backend = "local"

  config = {
    path = "../../modules/route_table/terraform.tfstate"
  }
}

data "terraform_remote_state" "subnet" {
  backend = "local"

  config = {
    path = "../../modules/subnet/terraform.tfstate"
  }
}

data "terraform_remote_state" "vpc" {
  backend = "local"

  config = {
    path = "../../modules/vpc/terraform.tfstate"
  }
}
