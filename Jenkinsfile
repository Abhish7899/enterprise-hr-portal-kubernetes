pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-2'
        AWS_ACCOUNT_ID = '637423415865'

        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        BACKEND_REPO = 'hrportal-backend'
        FRONTEND_REPO = 'hrportal-frontend'

        BACKEND_IMAGE = "${ECR_REGISTRY}/${BACKEND_REPO}"
        FRONTEND_IMAGE = "${ECR_REGISTRY}/${FRONTEND_REPO}"

        EKS_CLUSTER = 'hr-portal-dev-eks'
        K8S_NAMESPACE = 'hr-portal'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Test') {
            steps {
                dir('backend/hrportal') {
                    sh './mvnw test'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build \
                      -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                      ./backend/hrportal

                    docker build \
                      -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                      ./frontend
                '''
            }
        }

        stage('ECR Login') {
            steps {
                sh '''
                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login \
                      --username AWS \
                      --password-stdin ${ECR_REGISTRY}
                '''
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                    docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                    docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Configure EKS') {
            steps {
                sh '''
                    aws eks update-kubeconfig \
                      --region ${AWS_REGION} \
                      --name ${EKS_CLUSTER}

                    kubectl config current-context
                    kubectl get nodes
                '''
            }
        }

        stage('Deploy Backend') {
            steps {
                sh '''
                    kubectl -n ${K8S_NAMESPACE} set image \
                      deployment/backend \
                      backend=${BACKEND_IMAGE}:${BUILD_NUMBER}

                    kubectl -n ${K8S_NAMESPACE} rollout status \
                      deployment/backend \
                      --timeout=180s
                '''
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh '''
                    kubectl -n ${K8S_NAMESPACE} set image \
                      deployment/frontend \
                      frontend=${FRONTEND_IMAGE}:${BUILD_NUMBER}

                    kubectl -n ${K8S_NAMESPACE} rollout status \
                      deployment/frontend \
                      --timeout=180s
                '''
            }
        }

        stage('Application Verification') {
            steps {
                sh '''
                    echo "=== Deployments ==="
                    kubectl get deployments -n ${K8S_NAMESPACE}

                    echo "=== Pods ==="
                    kubectl get pods -n ${K8S_NAMESPACE}

                    echo "=== Services ==="
                    kubectl get services -n ${K8S_NAMESPACE}

                    echo "=== Ingress ==="
                    kubectl get ingress -n ${K8S_NAMESPACE}
                '''
            }
        }
    }

    post {
        success {
            echo "CI/CD deployment completed successfully."
            echo "Backend image: ${BACKEND_IMAGE}:${BUILD_NUMBER}"
            echo "Frontend image: ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
        }

        failure {
            echo "CI/CD pipeline failed. Check the failed stage and Jenkins console output."
        }

        always {
            sh 'docker logout ${ECR_REGISTRY} || true'
        }
    }
}
