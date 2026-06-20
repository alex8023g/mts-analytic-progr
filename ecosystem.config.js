module.exports = {
  apps: [
    {
      name: 'mts:backend:8000',
      cwd: './backend',
      script: '.venv/bin/fastapi',
      args: 'run app/main.py',
      interpreter: 'none',
    },
    {
      name: 'mts:frontend:3007',
      cwd: './frontend',
      script: 'npm',
      args: 'run start',
      env: {
        PORT: '3007',
        API_URL: 'http://127.0.0.1:8000',
      },
    },
  ],
};
