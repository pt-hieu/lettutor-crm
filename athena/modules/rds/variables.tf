data "terraform_remote_state" "sg" {
  backend = "local"

  config = {
    path = "../../modules/sg/terraform.tfstate"
  }
}

data "terraform_remote_state" "subnet" {
  backend = "local"

  config = {
    path = "../../modules/subnet/terraform.tfstate"
  }
}
