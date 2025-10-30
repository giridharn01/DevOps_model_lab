pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
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
                    call npm install
                    call npx vite build
                    '''
                }
            }
        }




        stage('Build Backend') {
            steps {
                dir('backend') {
                    bat 'npm install'
                    echo '✅ Backend dependencies installed successfully.'
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                echo '📦 Archiving frontend and backend build outputs...'
                archiveArtifacts artifacts: 'frontend/dist/**, backend/**', fingerprint: true
                echo '✅ Artifacts archived successfully.'
            }
        }

        stage('Verification') {
            steps {
                echo '🧱 Verifying backend structure...'
                bat '''
                cd backend
                node -e "require('fs').existsSync('src/server.js') ? console.log('✅ server.js found') : process.exit(1)"
                '''
                echo '🏁 Build pipeline completed successfully.'
            }
        }
    }

    post {
        success {
            echo '🎉 Build completed successfully and artifacts stored.'
        }
        failure {
            echo '❌ Build failed! Check logs for details.'
        }
    }
}
