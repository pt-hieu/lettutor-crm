terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  required_version = ">= 0.14.9"
}

provider "aws" {
  profile = "default"
  region  = "ap-east-1"
}

module "acm" {
  source = "./modules/acm"
}

module "alb" {
  source = "./modules/alb"
}

module "ebs" {
  source = "./modules/ebs"
}

module "ec2_instance" {
  source = "./modules/ec2_instance"
}

module "eip" {
  source = "./modules/eip"
}

module "eni" {
  source = "./modules/eni"
}

module "nacl" {
  source = "./modules/nacl"
}

module "rds" {
  source = "./modules/rds"
}

module "route_table" {
  source = "./modules/route_table"
}

module "route53" {
  source = "./modules/route53"
}

module "s3" {
  source = "./modules/s3"
}

module "sg" {
  source = "./modules/sg"
}

module "subnet" {
  source = "./modules/subnet"
}

module "vpc" {
  source = "./modules/vpc"
}
