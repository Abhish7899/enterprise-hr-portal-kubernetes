resource "aws_iam_policy" "load_balancer_controller" {
  name        = "${var.cluster_name}-load-balancer-controller"
  description = "IAM policy for AWS Load Balancer Controller"

  policy = file("${path.module}/aws-load-balancer-controller-policy.json")

  tags = {
    Environment = var.environment
    Project     = "hr-portal"
  }
}

resource "aws_iam_role" "load_balancer_controller" {
  name = "${var.cluster_name}-load-balancer-controller-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "pods.eks.amazonaws.com"
        }

        Action = [
          "sts:AssumeRole",
          "sts:TagSession"
        ]
      }
    ]
  })

  tags = {
    Environment = var.environment
    Project     = "hr-portal"
  }
}

resource "aws_iam_role_policy_attachment" "load_balancer_controller" {
  role       = aws_iam_role.load_balancer_controller.name
  policy_arn = aws_iam_policy.load_balancer_controller.arn
}

resource "aws_eks_pod_identity_association" "load_balancer_controller" {
  cluster_name    = aws_eks_cluster.this.name
  namespace       = "kube-system"
  service_account = "aws-load-balancer-controller"
  role_arn        = aws_iam_role.load_balancer_controller.arn

  depends_on = [
    aws_eks_addon.pod_identity_agent,
    aws_iam_role_policy_attachment.load_balancer_controller
  ]
}
