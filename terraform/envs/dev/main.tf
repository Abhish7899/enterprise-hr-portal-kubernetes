module "vpc" {
  source = "../../modules/vpc"

  vpc_cidr             = "10.0.0.0/16"
  project_name         = var.project_name
  environment          = var.environment
  availability_zones   = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

module "eks" {
  source = "../../modules/eks"

  cluster_name       = "${var.project_name}-${var.environment}-eks"
  kubernetes_version = "1.33"

  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids

  node_instance_types = ["t3.medium"]

  desired_size = 2
  min_size     = 2
  max_size     = 3

  environment = var.environment
}
