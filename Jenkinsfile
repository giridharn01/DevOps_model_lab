pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
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
                archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
            }
        }
    }

    post {
        success {
            echo '🎉 Build and artifact archive completed successfully!'
        }
        failure {
            echo '❌ Build failed. Check logs.'
        }
    }
}
