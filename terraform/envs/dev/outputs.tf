output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "vpc_cidr" {
  description = "VPC CIDR"
  value       = module.vpc.vpc_cidr
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = module.vpc.internet_gateway_id
}

output "public_route_table_id" {
  description = "Public route table ID"
  value       = module.vpc.public_route_table_id
}

output "nat_gateway_id" {
  description = "NAT Gateway ID"
  value       = module.vpc.nat_gateway_id
}

output "private_route_table_id" {
  description = "Private route table ID"
  value       = module.vpc.private_route_table_id
}

output "nat_eip" {
  description = "NAT Gateway Elastic IP"
  value       = module.vpc.nat_eip
}

output "backend_ecr_repository_url" {
  description = "ECR repository URL for backend"
  value       = module.eks.backend_ecr_repository_url
}

output "frontend_ecr_repository_url" {
  description = "ECR repository URL for frontend"
  value       = module.eks.frontend_ecr_repository_url
}
