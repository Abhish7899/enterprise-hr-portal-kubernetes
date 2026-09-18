variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version for EKS"
  type        = string
  default     = "1.33"
}

variable "vpc_id" {
  description = "VPC ID for EKS"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for EKS nodes"
  type        = list(string)
}

variable "node_instance_types" {
  description = "EC2 instance types for EKS nodes"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "desired_size" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 2
}

variable "min_size" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 2
}

variable "max_size" {
  description = "Maximum number of worker nodes"
  type        = number
  default     = 3
}

variable "environment" {
  description = "Environment name"
  type        = string
}
