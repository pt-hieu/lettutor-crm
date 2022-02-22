resource "aws_subnet" "tfer--subnet-00e46a0990c18ecd3" {
  assign_ipv6_address_on_creation                = "false"
  cidr_block                                     = "172.31.32.0/20"
  enable_dns64                                   = "false"
  enable_resource_name_dns_a_record_on_launch    = "false"
  enable_resource_name_dns_aaaa_record_on_launch = "false"
  ipv6_native                                    = "false"
  map_customer_owned_ip_on_launch                = "false"
  map_public_ip_on_launch                        = "true"
  private_dns_hostname_type_on_launch            = "ip-name"

  tags = {
    Name = "subnet 1"
  }

  tags_all = {
    Name = "subnet 1"
  }

  vpc_id = "${data.terraform_remote_state.vpc.outputs.aws_vpc_tfer--vpc-0117a201e2b9db678_id}"
}

resource "aws_subnet" "tfer--subnet-034d1be2f7491f28c" {
  assign_ipv6_address_on_creation                = "false"
  cidr_block                                     = "172.31.0.0/20"
  enable_dns64                                   = "false"
  enable_resource_name_dns_a_record_on_launch    = "false"
  enable_resource_name_dns_aaaa_record_on_launch = "false"
  ipv6_native                                    = "false"
  map_customer_owned_ip_on_launch                = "false"
  map_public_ip_on_launch                        = "true"
  private_dns_hostname_type_on_launch            = "ip-name"

  tags = {
    Name = "subnet 3"
  }

  tags_all = {
    Name = "subnet 3"
  }

  vpc_id = "${data.terraform_remote_state.vpc.outputs.aws_vpc_tfer--vpc-0117a201e2b9db678_id}"
}

resource "aws_subnet" "tfer--subnet-06cd7a7dff002c081" {
  assign_ipv6_address_on_creation                = "false"
  cidr_block                                     = "172.31.16.0/20"
  enable_dns64                                   = "false"
  enable_resource_name_dns_a_record_on_launch    = "false"
  enable_resource_name_dns_aaaa_record_on_launch = "false"
  ipv6_native                                    = "false"
  map_customer_owned_ip_on_launch                = "false"
  map_public_ip_on_launch                        = "true"
  private_dns_hostname_type_on_launch            = "ip-name"

  tags = {
    Name = "subnet 2"
  }

  tags_all = {
    Name = "subnet 2"
  }

  vpc_id = "${data.terraform_remote_state.vpc.outputs.aws_vpc_tfer--vpc-0117a201e2b9db678_id}"
}
