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

        SKIP_CI = 'false'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Detect GitOps Loop') {
            steps {
                script {
                    def commitMessage = sh(
                        script: 'git log -1 --pretty=%B',
                        returnStdout: true
                    ).trim()

                    echo "=== Commit Message ==="
                    echo commitMessage

                    if (commitMessage.startsWith(
                        'Update application images to build '
                    )) {

                        env.SKIP_CI = 'true'

                        echo "=========================================="
                        echo "Jenkins-generated GitOps commit detected"
                        echo "Skipping CI to prevent Jenkins loop"
                        echo "=========================================="

                    } else {

                        echo "Application/source commit detected"
                        echo "Running normal CI pipeline"

                    }
                }
            }
        }

        stage('Backend Test') {
            when {
                expression {
                    env.SKIP_CI != 'true'
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
                expression {
                    env.SKIP_CI != 'true'
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
                expression {
                    env.SKIP_CI != 'true'
                }
            }

            steps {
                sh '''
                    set -e

                    echo "=== Building Backend Image ==="

                    docker build \
                      -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                      ./backend/hrportal

                    echo "=== Building Frontend Image ==="

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
                expression {
                    env.SKIP_CI != 'true'
                }
            }

            steps {
                sh '''
                    set -e

                    echo "=== ECR Login ==="

                    aws ecr get-login-password \
                      --region ${AWS_REGION} | \
                    docker login \
                      --username AWS \
                      --password-stdin ${ECR_REGISTRY}
                '''
            }
        }

        stage('Push Images') {
            when {
                expression {
                    env.SKIP_CI != 'true'
                }
            }

            steps {
                sh '''
                    set -e

                    echo "=== Pushing Backend Image ==="

                    docker push \
                      ${BACKEND_IMAGE}:${BUILD_NUMBER}

                    echo "=== Pushing Frontend Image ==="

                    docker push \
                      ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Update GitOps Manifests') {
            when {
                expression {
                    env.SKIP_CI != 'true'
                }
            }

            steps {
                sh '''
                    set -e

                    echo "=== Updating GitOps manifests ==="

                    test -f ${GITOPS_BACKEND_MANIFEST}
                    test -f ${GITOPS_FRONTEND_MANIFEST}

                    sed -i \
                      "s#image: ${BACKEND_IMAGE}:.*#image: ${BACKEND_IMAGE}:${BUILD_NUMBER}#" \
                      ${GITOPS_BACKEND_MANIFEST}

                    sed -i \
                      "s#image: ${FRONTEND_IMAGE}:.*#image: ${FRONTEND_IMAGE}:${BUILD_NUMBER}#" \
                      ${GITOPS_FRONTEND_MANIFEST}

                    echo "=== Updated Backend Image ==="

                    grep "image:" \
                      ${GITOPS_BACKEND_MANIFEST}

                    echo "=== Updated Frontend Image ==="

                    grep "image:" \
                      ${GITOPS_FRONTEND_MANIFEST}

                    echo "=== Git Status ==="

                    git status --short

                    git config user.name "Jenkins GitOps"
                    git config user.email "jenkins-gitops@users.noreply.github.com"

                    git add \
                      ${GITOPS_BACKEND_MANIFEST} \
                      ${GITOPS_FRONTEND_MANIFEST}

                    git commit \
                      -m "Update application images to build ${BUILD_NUMBER}"

                    echo "=== Pushing GitOps Change ==="

                    GIT_SSH_COMMAND="ssh -i /var/lib/jenkins/.ssh/id_ed25519 -o StrictHostKeyChecking=yes" \
                    git push \
                      git@github.com:Abhish7899/enterprise-hr-portal-kubernetes.git \
                      HEAD:main
                '''
            }
        }

        stage('Application Verification') {
            when {
                expression {
                    env.SKIP_CI != 'true'
                }
            }

            steps {
                sh '''
                    set -e

                    echo "=== Waiting for Argo CD to reconcile ==="

                    sleep 30

                    echo "=== Kubernetes Deployments ==="

                    kubectl get deployments \
                      -n ${K8S_NAMESPACE}

                    echo "=== Kubernetes Pods ==="

                    kubectl get pods \
                      -n ${K8S_NAMESPACE}

                    echo "=== Kubernetes Services ==="

                    kubectl get services \
                      -n ${K8S_NAMESPACE}

                    echo "=== Ingress ==="

                    kubectl get ingress \
                      -n ${K8S_NAMESPACE}

                    ALB_HOST=$(kubectl get ingress hr-portal \
                      -n ${K8S_NAMESPACE} \
                      -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

                    echo "ALB: ${ALB_HOST}"

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
            echo "=========================================="
            echo "GitOps CI pipeline completed successfully"
            echo "=========================================="

            script {
                if (env.SKIP_CI == 'true') {

                    echo "GitOps-only commit detected."
                    echo "CI stages were skipped."
                    echo "Jenkins loop prevention successful."

                } else {

                    echo "Backend image:"
                    echo "${BACKEND_IMAGE}:${BUILD_NUMBER}"

                    echo "Frontend image:"
                    echo "${FRONTEND_IMAGE}:${BUILD_NUMBER}"

                    echo "GitOps:"
                    echo "GitHub → Argo CD → EKS"

                }
            }
        }

        failure {
            echo "=========================================="
            echo "Pipeline FAILED"
            echo "=========================================="

            echo "Check the failed stage and Jenkins console output."
        }

        always {
            sh '''
                docker logout ${ECR_REGISTRY} || true
            '''
        }
    }
}
