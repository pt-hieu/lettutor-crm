resource "aws_eip" "tfer--eipalloc-04f9837878a5970de" {
  instance             = "i-0188c01bc25367286"
  network_border_group = "ap-east-1"
  network_interface    = "eni-03a0ad40bc0d4aa9b"
  public_ipv4_pool     = "amazon"
  vpc                  = "true"
}

resource "aws_eip" "tfer--eipalloc-08c5086a904307b16" {
  instance             = "i-03617f5ddb18672ca"
  network_border_group = "ap-east-1"
  network_interface    = "eni-02f8e8bd70169a2f3"
  public_ipv4_pool     = "amazon"
  vpc                  = "true"
}
