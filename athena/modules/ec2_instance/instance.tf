resource "aws_instance" "tfer--i-0188c01bc25367286_crm-0020-dev" {
  ami                         = "ami-0b981d9ee99b28eba"
  associate_public_ip_address = "true"
  availability_zone           = "ap-east-1c"

  capacity_reservation_specification {
    capacity_reservation_preference = "open"
  }

  cpu_core_count       = "1"
  cpu_threads_per_core = "2"

  credit_specification {
    cpu_credits = "standard"
  }

  disable_api_termination = "false"
  ebs_optimized           = "true"

  enclave_options {
    enabled = "false"
  }

  get_password_data                    = "false"
  hibernation                          = "false"
  instance_initiated_shutdown_behavior = "terminate"
  instance_type                        = "t3.micro"
  ipv6_address_count                   = "0"
  key_name                             = "test ec2"

  metadata_options {
    http_endpoint               = "enabled"
    http_put_response_hop_limit = "1"
    http_tokens                 = "optional"
    instance_metadata_tags      = "disabled"
  }

  monitoring = "false"
  private_ip = "172.31.32.185"

  root_block_device {
    delete_on_termination = "true"
    encrypted             = "false"
    volume_size           = "10"
    volume_type           = "gp2"
  }

  security_groups   = ["launch-wizard-1"]
  source_dest_check = "true"
  subnet_id         = "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-00e46a0990c18ecd3_id}"

  tags = {
    Name = "crm dev"
  }

  tags_all = {
    Name = "crm dev"
  }

  tenancy                = "default"
  vpc_security_group_ids = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--launch-wizard-1_sg-0e3917197ef8b4377_id}"]
}

resource "aws_instance" "tfer--i-03617f5ddb18672ca_crm-0020-production" {
  ami                         = "ami-0b215afe809665ae5"
  associate_public_ip_address = "true"
  availability_zone           = "ap-east-1c"

  capacity_reservation_specification {
    capacity_reservation_preference = "open"
  }

  cpu_core_count       = "1"
  cpu_threads_per_core = "2"

  credit_specification {
    cpu_credits = "standard"
  }

  disable_api_termination = "false"
  ebs_optimized           = "true"

  enclave_options {
    enabled = "false"
  }

  get_password_data                    = "false"
  hibernation                          = "false"
  instance_initiated_shutdown_behavior = "stop"
  instance_type                        = "t3.micro"
  ipv6_address_count                   = "0"
  key_name                             = "test ec2"

  metadata_options {
    http_endpoint               = "enabled"
    http_put_response_hop_limit = "1"
    http_tokens                 = "optional"
    instance_metadata_tags      = "disabled"
  }

  monitoring = "false"
  private_ip = "172.31.46.122"

  root_block_device {
    delete_on_termination = "true"
    encrypted             = "false"

    tags = {
      Name = "test ec2"
    }

    volume_size = "25"
    volume_type = "gp2"
  }

  security_groups   = ["default"]
  source_dest_check = "true"
  subnet_id         = "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-00e46a0990c18ecd3_id}"

  tags = {
    Name = "crm production"
  }

  tags_all = {
    Name = "crm production"
  }

  tenancy                = "default"
  vpc_security_group_ids = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--default_sg-0c3a2e558a6a67a84_id}"]
}
