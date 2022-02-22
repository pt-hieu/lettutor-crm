resource "aws_lb" "tfer--crm-dev" {
  desync_mitigation_mode     = "defensive"
  drop_invalid_header_fields = "false"
  enable_deletion_protection = "false"
  enable_http2               = "true"
  enable_waf_fail_open       = "false"
  idle_timeout               = "60"
  internal                   = "false"
  ip_address_type            = "ipv4"
  load_balancer_type         = "application"
  name                       = "crm-dev"
  security_groups            = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--default_sg-0c3a2e558a6a67a84_id}"]

  subnet_mapping {
    subnet_id = "subnet-034d1be2f7491f28c"
  }

  subnet_mapping {
    subnet_id = "subnet-00e46a0990c18ecd3"
  }

  subnets = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-034d1be2f7491f28c_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-00e46a0990c18ecd3_id}"]
}

resource "aws_lb" "tfer--test" {
  desync_mitigation_mode     = "defensive"
  drop_invalid_header_fields = "false"
  enable_deletion_protection = "false"
  enable_http2               = "true"
  enable_waf_fail_open       = "false"
  idle_timeout               = "60"
  internal                   = "false"
  ip_address_type            = "ipv4"
  load_balancer_type         = "application"
  name                       = "test"
  security_groups            = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--default_sg-0c3a2e558a6a67a84_id}"]

  subnet_mapping {
    subnet_id = "subnet-00e46a0990c18ecd3"
  }

  subnet_mapping {
    subnet_id = "subnet-034d1be2f7491f28c"
  }

  subnets = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-00e46a0990c18ecd3_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-034d1be2f7491f28c_id}"]
}
