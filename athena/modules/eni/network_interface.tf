resource "aws_network_interface" "tfer--eni-02f8e8bd70169a2f3" {
  attachment {
    device_index = "0"
    instance     = "i-03617f5ddb18672ca"
  }

  description        = "Primary network interface"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.46.122"
  private_ip_list    = ["172.31.46.122"]
  private_ips        = ["172.31.46.122"]
  private_ips_count  = "0"
  security_groups    = ["sg-0c3a2e558a6a67a84"]
  source_dest_check  = "true"
  subnet_id          = "subnet-00e46a0990c18ecd3"

  tags = {
    Name = "test ec2"
  }

  tags_all = {
    Name = "test ec2"
  }
}

resource "aws_network_interface" "tfer--eni-03348110e24433a8e" {
  description        = "ELB app/test/6be875d7f742645d"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.15.66"
  private_ip_list    = ["172.31.15.66"]
  private_ips        = ["172.31.15.66"]
  private_ips_count  = "0"
  security_groups    = ["sg-0c3a2e558a6a67a84"]
  source_dest_check  = "true"
  subnet_id          = "subnet-034d1be2f7491f28c"
}

resource "aws_network_interface" "tfer--eni-03351bd3506dc3465" {
  description        = "ELB app/crm-dev/2c616992d865732e"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.46.204"
  private_ip_list    = ["172.31.46.204"]
  private_ips        = ["172.31.46.204"]
  private_ips_count  = "0"
  security_groups    = ["sg-0c3a2e558a6a67a84"]
  source_dest_check  = "true"
  subnet_id          = "subnet-00e46a0990c18ecd3"
}

resource "aws_network_interface" "tfer--eni-03a0ad40bc0d4aa9b" {
  attachment {
    device_index = "0"
    instance     = "i-0188c01bc25367286"
  }

  description        = "Primary network interface"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.32.185"
  private_ip_list    = ["172.31.32.185"]
  private_ips        = ["172.31.32.185"]
  private_ips_count  = "0"
  security_groups    = ["sg-0e3917197ef8b4377"]
  source_dest_check  = "true"
  subnet_id          = "subnet-00e46a0990c18ecd3"
}

resource "aws_network_interface" "tfer--eni-040dd8f764434d637" {
  description        = "ELB app/crm-dev/2c616992d865732e"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.3.139"
  private_ip_list    = ["172.31.3.139"]
  private_ips        = ["172.31.3.139"]
  private_ips_count  = "0"
  security_groups    = ["sg-0c3a2e558a6a67a84"]
  source_dest_check  = "true"
  subnet_id          = "subnet-034d1be2f7491f28c"
}

resource "aws_network_interface" "tfer--eni-09a1a608801558b53" {
  description        = "ELB app/test/6be875d7f742645d"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.45.104"
  private_ip_list    = ["172.31.45.104"]
  private_ips        = ["172.31.45.104"]
  private_ips_count  = "0"
  security_groups    = ["sg-0c3a2e558a6a67a84"]
  source_dest_check  = "true"
  subnet_id          = "subnet-00e46a0990c18ecd3"
}
