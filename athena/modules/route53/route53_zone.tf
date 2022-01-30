resource "aws_route53_zone" "tfer--Z06354454FVX3ENIMYWL_bee-club-002E-org" {
  comment       = "HostedZone created by Route53 Registrar"
  force_destroy = "false"
  name          = "bee-club.org"
}

resource "aws_route53_zone" "tfer--Z0774431171WQ3K4FFAFP_web-crm-002E-software" {
  comment       = "For CRM"
  force_destroy = "false"
  name          = "web-crm.software"
}
