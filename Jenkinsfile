pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/giridharn01/DevOps_model_lab.git'
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'frontend/dist/**/*', fingerprint: true
            }
        }

        stage('Deploy Locally') {
            steps {
                echo '🚀 Starting local deployment...'
                bat '''
                cd backend
                set PORT=3000
                node src/server.js
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Build, archive, and local deployment completed successfully!'
        }
        failure {
            echo '❌ Build or deploy failed. Check the logs!'
        }
    }
}
