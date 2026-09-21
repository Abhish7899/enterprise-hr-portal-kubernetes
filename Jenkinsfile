pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        AWS_REGION = 'us-east-2'
        AWS_ACCOUNT_ID = '637423415865'

        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        BACKEND_REPO = 'hrportal-backend'
        FRONTEND_REPO = 'hrportal-frontend'

        BACKEND_IMAGE = "${ECR_REGISTRY}/${BACKEND_REPO}"
        FRONTEND_IMAGE = "${ECR_REGISTRY}/${FRONTEND_REPO}"

        GITOPS_BACKEND_MANIFEST = 'k8s/gitops/backend.yaml'
        GITOPS_FRONTEND_MANIFEST = 'k8s/gitops/frontend.yaml'

        K8S_NAMESPACE = 'hr-portal'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Test') {
            when {
                not {
                    changelog '.*Update application images to build .*'
                }
            }

            steps {
                dir('backend/hrportal') {
                    sh '''
                        set -e

                        echo "======================================"
                        echo "        Backend Tests"
                        echo "======================================"

                        ./mvnw test
                    '''
                }
            }
        }

        stage('Frontend Build') {
            when {
                not {
                    changelog '.*Update application images to build .*'
                }
            }

            steps {
                dir('frontend') {
                    sh '''
                        set -e

                        echo "======================================"
                        echo "        Frontend Build"
                        echo "======================================"

                        npm ci
                        npm run build
                    '''
                }
            }
        }

        stage('Docker Build') {
            when {
                not {
                    changelog '.*Update application images to build .*'
                }
            }

            steps {
                sh '''
                    set -e

                    echo "======================================"
                    echo "        Docker Build"
                    echo "======================================"

                    docker build \
                      -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                      ./backend/hrportal

                    docker build \
                      -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                      ./frontend

                    echo "=== Docker Images ==="

                    docker images | grep -E \
                      "hrportal-backend|hrportal-frontend"
                '''
            }
        }

        stage('ECR Login') {
            when {
                not {
                    changelog '.*Update application images to build .*'
                }
            }

            steps {
                sh '''
                    set -e

                    echo "======================================"
                    echo "        ECR Login"
                    echo "======================================"

                    aws ecr get-login-password \
                      --region ${AWS_REGION} |
                    docker login \
                      --username AWS \
                      --password-stdin ${ECR_REGISTRY}
                '''
            }
        }

        stage('Push Images') {
            when {
                not {
                    changelog '.*Update application images to build .*'
                }
            }

            steps {
                sh '''
                    set -e

                    echo "======================================"
                    echo "        Push Images to ECR"
                    echo "======================================"

                    docker push \
                      ${BACKEND_IMAGE}:${BUILD_NUMBER}

                    docker push \
                      ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Update GitOps Manifests') {
            when {
                not {
                    changelog '.*Update application images to build .*'
                }
            }

            steps {
                sh '''
                    set -e

                    echo "======================================"
                    echo "        Update GitOps Manifests"
                    echo "======================================"

                    test -f ${GITOPS_BACKEND_MANIFEST}
                    test -f ${GITOPS_FRONTEND_MANIFEST}

                    sed -i \
                      "s#image: ${BACKEND_IMAGE}:.*#image: ${BACKEND_IMAGE}:${BUILD_NUMBER}#" \
                      ${GITOPS_BACKEND_MANIFEST}

                    sed -i \
                      "s#image: ${FRONTEND_IMAGE}:.*#image: ${FRONTEND_IMAGE}:${BUILD_NUMBER}#" \
                      ${GITOPS_FRONTEND_MANIFEST}

                    echo "=== Backend Image ==="
                    grep "image:" ${GITOPS_BACKEND_MANIFEST}

                    echo "=== Frontend Image ==="
                    grep "image:" ${GITOPS_FRONTEND_MANIFEST}

                    echo "=== Git Configuration ==="

                    git config user.name "Jenkins GitOps"
                    git config user.email "jenkins-gitops@users.noreply.github.com"

                    git add \
                      ${GITOPS_BACKEND_MANIFEST} \
                      ${GITOPS_FRONTEND_MANIFEST}

                    git commit \
                      -m "Update application images to build ${BUILD_NUMBER}"

                    echo "=== Push GitOps Commit ==="

                    GIT_SSH_COMMAND="ssh -i /var/lib/jenkins/.ssh/id_ed25519 -o StrictHostKeyChecking=yes" \
                    git push \
                      git@github.com:Abhish7899/enterprise-hr-portal-kubernetes.git \
                      HEAD:main
                '''
            }
        }

        stage('Application Verification') {
            when {
                not {
                    changelog '.*Update application images to build .*'
                }
            }

            steps {
                sh '''
                    set -e

                    echo "======================================"
                    echo "     Application Verification"
                    echo "======================================"

                    echo "Waiting for Kubernetes deployments to become ready..."

                    echo "=== Backend Rollout ==="

                    kubectl rollout status \
                      deployment/backend \
                      -n ${K8S_NAMESPACE} \
                      --timeout=180s

                    echo "=== Frontend Rollout ==="

                    kubectl rollout status \
                      deployment/frontend \
                      -n ${K8S_NAMESPACE} \
                      --timeout=180s

                    echo "=== Deployments ==="

                    kubectl get deployments \
                      -n ${K8S_NAMESPACE}

                    echo "=== Pods ==="

                    kubectl get pods \
                      -n ${K8S_NAMESPACE}

                    echo "=== Ingress ==="

                    ALB_HOST=$(kubectl get ingress hr-portal \
                      -n ${K8S_NAMESPACE} \
                      -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

                    echo "ALB Host: ${ALB_HOST}"

                    if [ -z "${ALB_HOST}" ]; then
                        echo "ERROR: ALB hostname was not found"
                        exit 1
                    fi

                    echo "=== API Health Check ==="

                    HTTP_CODE=$(curl \
                      -sS \
                      --max-time 30 \
                      -w "%{http_code}" \
                      -o /dev/null \
                      "http://${ALB_HOST}/api/employees")

                    echo "HTTP Status: ${HTTP_CODE}"

                    if [ "${HTTP_CODE}" != "200" ]; then
                        echo "ERROR: Application health check failed"
                        exit 1
                    fi

                    echo "======================================"
                    echo " Application health check PASSED"
                    echo "======================================"
                '''
            }
        }
    }

    post {

        success {
            echo "GitOps CI pipeline completed successfully."
        }

        failure {
            echo "Pipeline FAILED."
        }

        always {
            sh '''
                docker logout ${ECR_REGISTRY} || true
            '''
        }
    }
}
