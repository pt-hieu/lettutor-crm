resource "aws_network_acl" "tfer--acl-07be5a17884b78c2a" {
  egress {
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = "0"
    icmp_code  = "0"
    icmp_type  = "0"
    protocol   = "-1"
    rule_no    = "100"
    to_port    = "0"
  }

  ingress {
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = "0"
    icmp_code  = "0"
    icmp_type  = "0"
    protocol   = "-1"
    rule_no    = "100"
    to_port    = "0"
  }

  subnet_ids = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-00e46a0990c18ecd3_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-06cd7a7dff002c081_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-034d1be2f7491f28c_id}"]
  vpc_id     = "${data.terraform_remote_state.vpc.outputs.aws_vpc_tfer--vpc-0117a201e2b9db678_id}"
}
