pipeline {
    agent any

    environment {
        NODE_HOME = "C:\\Program Files\\nodejs"
        PATH = "${NODE_HOME};${env.PATH}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/giridharn01/DevOps_model_lab.git'
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat '''
                    echo === Installing frontend dependencies ===
                    call npm install
                    echo === Building frontend with Vite ===
                    call npm run build
                    '''
                }
            }
        }

        stage('Setup Backend') {
            steps {
                dir('backend') {
                    bat '''
                    echo === Installing backend dependencies ===
                    call npm install
                    echo === Checking available npm scripts ===
                    call npm run || echo "No build script found, skipping build step."
                    '''
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                echo "Archiving built frontend and backend files..."
                archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
                archiveArtifacts artifacts: 'backend/**', fingerprint: true
            }
        }
    }

    post {
        success {
            echo '✅ Build completed successfully! Artifacts archived.'
        }
        failure {
            echo '❌ Build failed! Check logs for details.'
        }
    }
}
