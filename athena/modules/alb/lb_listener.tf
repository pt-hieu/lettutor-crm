resource "aws_lb_listener" "tfer--arn-003A-aws-003A-elasticloadbalancing-003A-ap-east-1-003A-821378024988-003A-listener-002F-app-002F-crm-dev-002F-2c616992d865732e-002F-9aebca9e04c94baf" {
  default_action {
    target_group_arn = "arn:aws:elasticloadbalancing:ap-east-1:821378024988:targetgroup/crm-dev-frontend/b2b4a0708de02a19"
    type             = "forward"
  }

  load_balancer_arn = "${data.terraform_remote_state.alb.outputs.aws_lb_tfer--crm-dev_id}"
  port              = "80"
  protocol          = "HTTP"
}

resource "aws_lb_listener" "tfer--arn-003A-aws-003A-elasticloadbalancing-003A-ap-east-1-003A-821378024988-003A-listener-002F-app-002F-test-002F-6be875d7f742645d-002F-5884da1c026e4c84" {
  default_action {
    order = "1"

    redirect {
      host        = "#{host}"
      path        = "/#{path}"
      port        = "443"
      protocol    = "HTTPS"
      query       = "#{query}"
      status_code = "HTTP_301"
    }

    type = "redirect"
  }

  load_balancer_arn = "${data.terraform_remote_state.alb.outputs.aws_lb_tfer--test_id}"
  port              = "80"
  protocol          = "HTTP"
}

resource "aws_lb_listener" "tfer--arn-003A-aws-003A-elasticloadbalancing-003A-ap-east-1-003A-821378024988-003A-listener-002F-app-002F-test-002F-6be875d7f742645d-002F-a6e12c6ff26e0b40" {
  certificate_arn = "arn:aws:acm:ap-east-1:821378024988:certificate/7c93db4f-6b14-4553-8df2-6acf9efa2f6e"

  default_action {
    target_group_arn = "arn:aws:elasticloadbalancing:ap-east-1:821378024988:targetgroup/crm/46ab67702ec0004a"
    type             = "forward"
  }

  load_balancer_arn = "${data.terraform_remote_state.alb.outputs.aws_lb_tfer--test_id}"
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
}
