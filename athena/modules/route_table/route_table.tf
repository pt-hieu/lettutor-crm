resource "aws_route_table" "tfer--rtb-05eee1824b51d0b1a" {
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = "igw-01c33281a28a83e96"
  }

  vpc_id = "${data.terraform_remote_state.vpc.outputs.aws_vpc_tfer--vpc-0117a201e2b9db678_id}"
}
