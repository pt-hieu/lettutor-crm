data "terraform_remote_state" "vpc" {
  backend = "local"

  config = {
    path = "../../modules/vpc/terraform.tfstate"
  }
}
