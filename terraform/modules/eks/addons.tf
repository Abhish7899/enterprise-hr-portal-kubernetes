resource "aws_eks_addon" "pod_identity_agent" {
  cluster_name = aws_eks_cluster.this.name
  addon_name   = "eks-pod-identity-agent"

  depends_on = [
    aws_eks_node_group.this
  ]
}

resource "aws_eks_addon" "ebs_csi" {
  cluster_name = aws_eks_cluster.this.name
  addon_name   = "aws-ebs-csi-driver"

  pod_identity_association {
    service_account = "ebs-csi-controller-sa"
    role_arn        = aws_iam_role.ebs_csi.arn
  }

  depends_on = [
    aws_eks_addon.pod_identity_agent,
    aws_iam_role_policy_attachment.ebs_csi
  ]

  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "PRESERVE"
}
