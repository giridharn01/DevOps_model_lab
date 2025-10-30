pipeline {
    agent any
    tools {
        nodejs "NodeJS_20"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Fetching code from GitHub...'
                checkout scm
            }
        }

        stage('Install & Build Frontend') {
            steps {
                dir('frontend') {
                    echo 'Installing frontend dependencies...'
                    bat 'npm install'
                    echo 'Building frontend...'
                    bat 'npm run build'
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    echo 'Installing backend dependencies...'
                    bat 'npm install'
                }
            }
        }

        stage('Archive Build Artifacts') {
            steps {
                archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
            }
        }
    }

    post {
        success {
            echo '✅ Build completed successfully!'
        }
        failure {
            echo '❌ Build failed! Check logs for details.'
        }
    }
}
