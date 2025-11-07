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
                    bat '''
                    call npm install
                    call npm run build
                    '''
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    bat '''
                    call npm install
                    call npm run build
                    '''
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: '**/dist/**', fingerprint: true
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
