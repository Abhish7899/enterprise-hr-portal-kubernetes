resource "aws_ecr_repository" "backend" {
  name                 = "hrportal-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = var.environment
    Project     = "hr-portal"
    Component   = "backend"
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "hrportal-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = var.environment
    Project     = "hr-portal"
    Component   = "frontend"
  }
}
