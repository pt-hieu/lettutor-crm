resource "aws_lb_listener_rule" "tfer--arn-003A-aws-003A-elasticloadbalancing-003A-ap-east-1-003A-821378024988-003A-listener-rule-002F-app-002F-crm-dev-002F-2c616992d865732e-002F-9aebca9e04c94baf-002F-3c7e76b13947c8c1" {
  action {
    order            = "1"
    target_group_arn = "arn:aws:elasticloadbalancing:ap-east-1:821378024988:targetgroup/crm-dev-cms/02229612c77f237d"
    type             = "forward"
  }

  condition {
    http_header {
      http_header_name = "x-forward-to"
      values           = ["cms"]
    }
  }

  listener_arn = "${data.terraform_remote_state.alb.outputs.aws_lb_listener_tfer--arn-003A-aws-003A-elasticloadbalancing-003A-ap-east-1-003A-821378024988-003A-listener-002F-app-002F-crm-dev-002F-2c616992d865732e-002F-9aebca9e04c94baf_id}"
  priority     = "1"
}

resource "aws_lb_listener_rule" "tfer--arn-003A-aws-003A-elasticloadbalancing-003A-ap-east-1-003A-821378024988-003A-listener-rule-002F-app-002F-crm-dev-002F-2c616992d865732e-002F-9aebca9e04c94baf-002F-6cd57ab107fec5c5" {
  action {
    order            = "1"
    target_group_arn = "arn:aws:elasticloadbalancing:ap-east-1:821378024988:targetgroup/crm-dev-backend/b481351f6c83be1c"
    type             = "forward"
  }

  condition {
    path_pattern {
      values = ["/v1/*", "/docs/*", "/docs", "/v1"]
    }
  }

  listener_arn = "${data.terraform_remote_state.alb.outputs.aws_lb_listener_tfer--arn-003A-aws-003A-elasticloadbalancing-003A-ap-east-1-003A-821378024988-003A-listener-002F-app-002F-crm-dev-002F-2c616992d865732e-002F-9aebca9e04c94baf_id}"
  priority     = "2"
}

resource "aws_lb_listener_rule" "tfer--arn-003A-aws-003A-elasticloadbalancing-003A-ap-east-1-003A-821378024988-003A-listener-rule-002F-app-002F-test-002F-6be875d7f742645d-002F-a6e12c6ff26e0b40-002F-0569c922ce43b026" {
  action {
    order            = "1"
    target_group_arn = "arn:aws:elasticloadbalancing:ap-east-1:821378024988:targetgroup/crm-backend/4f6f899517d68fb8"
    type             = "forward"
  }

  condition {
    path_pattern {
      values = ["/docs", "/v1/*", "/v1", "/docs/*"]
    }
  }

  listener_arn = "${data.terraform_remote_state.alb.outputs.aws_lb_listener_tfer--arn-003A-aws-003A-elasticloadbalancing-003A-ap-east-1-003A-821378024988-003A-listener-002F-app-002F-test-002F-6be875d7f742645d-002F-a6e12c6ff26e0b40_id}"
  priority     = "2"
}

resource "aws_lb_listener_rule" "tfer--arn-003A-aws-003A-elasticloadbalancing-003A-ap-east-1-003A-821378024988-003A-listener-rule-002F-app-002F-test-002F-6be875d7f742645d-002F-a6e12c6ff26e0b40-002F-cf77833bc048a757" {
  action {
    order            = "1"
    target_group_arn = "arn:aws:elasticloadbalancing:ap-east-1:821378024988:targetgroup/crm-cms/b0a69e7dde975c01"
    type             = "forward"
  }

  condition {
    http_header {
      http_header_name = "x-forward-to"
      values           = ["cms"]
    }
  }

  listener_arn = "${data.terraform_remote_state.alb.outputs.aws_lb_listener_tfer--arn-003A-aws-003A-elasticloadbalancing-003A-ap-east-1-003A-821378024988-003A-listener-002F-app-002F-test-002F-6be875d7f742645d-002F-a6e12c6ff26e0b40_id}"
  priority     = "1"
}
