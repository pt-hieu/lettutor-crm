resource "aws_acm_certificate" "tfer--7c93db4f-6b14-4553-8df2-6acf9efa2f6e_artemis-002E-web-crm-002E-software" {
  domain_name = "artemis.web-crm.software"

  options {
    certificate_transparency_logging_preference = "DISABLED"
  }

  validation_method = "NONE"
}
