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
                        echo "=== Backend Tests ==="
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
                        echo "=== Frontend Build ==="
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

                    docker build \
                      -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                      ./backend/hrportal

                    docker build \
                      -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                      ./frontend

                    docker images | grep -E "hrportal-backend|hrportal-frontend"
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

                    docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                    docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
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

                    test -f ${GITOPS_BACKEND_MANIFEST}
                    test -f ${GITOPS_FRONTEND_MANIFEST}

                    sed -i \
                      "s#image: ${BACKEND_IMAGE}:.*#image: ${BACKEND_IMAGE}:${BUILD_NUMBER}#" \
                      ${GITOPS_BACKEND_MANIFEST}

                    sed -i \
                      "s#image: ${FRONTEND_IMAGE}:.*#image: ${FRONTEND_IMAGE}:${BUILD_NUMBER}#" \
                      ${GITOPS_FRONTEND_MANIFEST}

                    grep "image:" ${GITOPS_BACKEND_MANIFEST}
                    grep "image:" ${GITOPS_FRONTEND_MANIFEST}

                    git config user.name "Jenkins GitOps"
                    git config user.email "jenkins-gitops@users.noreply.github.com"

                    git add \
                      ${GITOPS_BACKEND_MANIFEST} \
                      ${GITOPS_FRONTEND_MANIFEST}

                    git commit \
                      -m "Update application images to build ${BUILD_NUMBER}"

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

                    echo "Waiting for Argo CD to reconcile..."
                    sleep 30

                    kubectl get deployments -n ${K8S_NAMESPACE}
                    kubectl get pods -n ${K8S_NAMESPACE}

                    ALB_HOST=$(kubectl get ingress hr-portal \
                      -n ${K8S_NAMESPACE} \
                      -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

                    HTTP_CODE=$(curl -sS \
                      --max-time 30 \
                      -w "%{http_code}" \
                      -o /dev/null \
                      "http://${ALB_HOST}/api/employees")

                    echo "HTTP Status: ${HTTP_CODE}"

                    if [ "${HTTP_CODE}" != "200" ]; then
                        echo "Application health check FAILED"
                        exit 1
                    fi

                    echo "Application health check PASSED"
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
