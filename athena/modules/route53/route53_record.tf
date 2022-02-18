resource "aws_route53_record" "tfer--Z06354454FVX3ENIMYWL_6inwkyvnogpixpmeoipxbwwc7ldbvvxa-002E-_domainkey-002E-bee-club-002E-org-002E-_CNAME_" {
  name    = "6inwkyvnogpixpmeoipxbwwc7ldbvvxa._domainkey.bee-club.org"
  records = ["6inwkyvnogpixpmeoipxbwwc7ldbvvxa.dkim.amazonses.com."]
  ttl     = "600"
  type    = "CNAME"
  zone_id = "${aws_route53_zone.tfer--Z06354454FVX3ENIMYWL_bee-club-002E-org.zone_id}"
}

resource "aws_route53_record" "tfer--Z06354454FVX3ENIMYWL__amazonses-002E-bee-club-002E-org-002E-_TXT_" {
  name    = "_amazonses.bee-club.org"
  records = ["YCW2LPR0wjG1PwFqVz3Y0wANoFPpcyLxuLiPKUrjQQY="]
  ttl     = "600"
  type    = "TXT"
  zone_id = "${aws_route53_zone.tfer--Z06354454FVX3ENIMYWL_bee-club-002E-org.zone_id}"
}

resource "aws_route53_record" "tfer--Z06354454FVX3ENIMYWL_autodiscover-002E-bee-club-002E-org-002E-_CNAME_" {
  name    = "autodiscover.bee-club.org"
  records = ["autodiscover.mail.us-east-1.awsapps.com."]
  ttl     = "600"
  type    = "CNAME"
  zone_id = "${aws_route53_zone.tfer--Z06354454FVX3ENIMYWL_bee-club-002E-org.zone_id}"
}

resource "aws_route53_record" "tfer--Z06354454FVX3ENIMYWL_bee-club-002E-org-002E-_MX_" {
  name    = "bee-club.org"
  records = ["10 inbound-smtp.us-east-1.amazonaws.com."]
  ttl     = "600"
  type    = "MX"
  zone_id = "${aws_route53_zone.tfer--Z06354454FVX3ENIMYWL_bee-club-002E-org.zone_id}"
}

resource "aws_route53_record" "tfer--Z06354454FVX3ENIMYWL_bee-club-002E-org-002E-_NS_" {
  name    = "bee-club.org"
  records = ["ns-902.awsdns-48.net.", "ns-1366.awsdns-42.org.", "ns-1629.awsdns-11.co.uk.", "ns-424.awsdns-53.com."]
  ttl     = "172800"
  type    = "NS"
  zone_id = "${aws_route53_zone.tfer--Z06354454FVX3ENIMYWL_bee-club-002E-org.zone_id}"
}

resource "aws_route53_record" "tfer--Z06354454FVX3ENIMYWL_bee-club-002E-org-002E-_SOA_" {
  name    = "bee-club.org"
  records = ["ns-902.awsdns-48.net. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"]
  ttl     = "900"
  type    = "SOA"
  zone_id = "${aws_route53_zone.tfer--Z06354454FVX3ENIMYWL_bee-club-002E-org.zone_id}"
}

resource "aws_route53_record" "tfer--Z06354454FVX3ENIMYWL_pcmlhahqufrjh7cvjdvz4j2pgsg7r6j3-002E-_domainkey-002E-bee-club-002E-org-002E-_CNAME_" {
  name    = "pcmlhahqufrjh7cvjdvz4j2pgsg7r6j3._domainkey.bee-club.org"
  records = ["pcmlhahqufrjh7cvjdvz4j2pgsg7r6j3.dkim.amazonses.com."]
  ttl     = "600"
  type    = "CNAME"
  zone_id = "${aws_route53_zone.tfer--Z06354454FVX3ENIMYWL_bee-club-002E-org.zone_id}"
}

resource "aws_route53_record" "tfer--Z06354454FVX3ENIMYWL_vl45c33xqjukytq33qydwlaxww5inpya-002E-_domainkey-002E-bee-club-002E-org-002E-_CNAME_" {
  name    = "vl45c33xqjukytq33qydwlaxww5inpya._domainkey.bee-club.org"
  records = ["vl45c33xqjukytq33qydwlaxww5inpya.dkim.amazonses.com."]
  ttl     = "600"
  type    = "CNAME"
  zone_id = "${aws_route53_zone.tfer--Z06354454FVX3ENIMYWL_bee-club-002E-org.zone_id}"
}

resource "aws_route53_record" "tfer--Z0774431171WQ3K4FFAFP__965981e32f3251925ae8c24e09d0f783-002E-web-crm-002E-software-002E-_CNAME_" {
  name    = "_965981e32f3251925ae8c24e09d0f783.web-crm.software"
  records = ["EA796CA92E19A324656A80A525904BEA.AD09A561DD5A4DC12238E76D83CD8F37.6a2199e370271c1.comodoca.com"]
  ttl     = "3600"
  type    = "CNAME"
  zone_id = "${aws_route53_zone.tfer--Z0774431171WQ3K4FFAFP_web-crm-002E-software.zone_id}"
}

resource "aws_route53_record" "tfer--Z0774431171WQ3K4FFAFP_artemis-002E-web-crm-002E-software-002E-_CNAME_" {
  name    = "artemis.web-crm.software"
  records = ["test-368335589.ap-east-1.elb.amazonaws.com"]
  ttl     = "300"
  type    = "CNAME"
  zone_id = "${aws_route53_zone.tfer--Z0774431171WQ3K4FFAFP_web-crm-002E-software.zone_id}"
}

resource "aws_route53_record" "tfer--Z0774431171WQ3K4FFAFP_dev-artemis-002E-web-crm-002E-software-002E-_CNAME_" {
  name    = "dev-artemis.web-crm.software"
  records = ["crm-dev-1197896151.ap-east-1.elb.amazonaws.com"]
  ttl     = "300"
  type    = "CNAME"
  zone_id = "${aws_route53_zone.tfer--Z0774431171WQ3K4FFAFP_web-crm-002E-software.zone_id}"
}

resource "aws_route53_record" "tfer--Z0774431171WQ3K4FFAFP_web-crm-002E-software-002E-_NS_" {
  name    = "web-crm.software"
  records = ["ns-1207.awsdns-22.org.", "ns-2016.awsdns-60.co.uk.", "ns-501.awsdns-62.com.", "ns-861.awsdns-43.net."]
  ttl     = "172800"
  type    = "NS"
  zone_id = "${aws_route53_zone.tfer--Z0774431171WQ3K4FFAFP_web-crm-002E-software.zone_id}"
}

resource "aws_route53_record" "tfer--Z0774431171WQ3K4FFAFP_web-crm-002E-software-002E-_SOA_" {
  name    = "web-crm.software"
  records = ["ns-501.awsdns-62.com. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"]
  ttl     = "900"
  type    = "SOA"
  zone_id = "${aws_route53_zone.tfer--Z0774431171WQ3K4FFAFP_web-crm-002E-software.zone_id}"
}
