pipeline {
    agent any

    tools {
        nodejs 'NodeJS_20'  // Ensure this name matches your Jenkins NodeJS tool name
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

        stage('Deploy Locally') {
            steps {
                dir('backend') {
                    echo 'Deploying frontend build to backend...'
                    bat 'if not exist public mkdir public'
                    bat 'xcopy /E /I /Y "..\\frontend\\dist\\*" "public\\"'
                    echo 'Starting backend server...'
                    bat 'start /B npm run start'
                }
            }
        }

        stage('Archive Build Artifacts') {
            steps {
                archiveArtifacts artifacts: '**/dist/**', fingerprint: true
            }
        }
    }

    post {
        success {
            echo '✅ Build & Deployment completed successfully!'
        }
        failure {
            echo '❌ Build failed. Check logs for errors.'
        }
    }
}
