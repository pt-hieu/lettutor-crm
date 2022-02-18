data "terraform_remote_state" "sg" {
  backend = "local"

  config = {
    path = "../../modules/sg/terraform.tfstate"
  }
}
