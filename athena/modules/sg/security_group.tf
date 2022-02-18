resource "aws_security_group" "tfer--default_sg-0c3a2e558a6a67a84" {
  description = "default VPC security group"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  name   = "default"
  vpc_id = "vpc-0117a201e2b9db678"
}

resource "aws_security_group" "tfer--launch-wizard-1_sg-0e3917197ef8b4377" {
  description = "launch-wizard-1 created 2022-01-23T14:17:53.828+07:00"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  name   = "launch-wizard-1"
  vpc_id = "vpc-0117a201e2b9db678"
}
