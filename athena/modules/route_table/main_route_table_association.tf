resource "aws_main_route_table_association" "tfer--vpc-0117a201e2b9db678" {
  route_table_id = "${data.terraform_remote_state.route_table.outputs.aws_route_table_tfer--rtb-05eee1824b51d0b1a_id}"
  vpc_id         = "${data.terraform_remote_state.vpc.outputs.aws_vpc_tfer--vpc-0117a201e2b9db678_id}"
}
