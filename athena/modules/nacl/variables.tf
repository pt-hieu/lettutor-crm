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
