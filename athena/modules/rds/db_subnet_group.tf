resource "aws_db_subnet_group" "tfer--default-vpc-0117a201e2b9db678" {
  description = "Created from the RDS Management Console"
  name        = "default-vpc-0117a201e2b9db678"
  subnet_ids  = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-034d1be2f7491f28c_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-00e46a0990c18ecd3_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-06cd7a7dff002c081_id}"]
}
