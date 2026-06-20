инструкция для запуска проекта целиком смотри README.md в корневой папке

# Запуск backend

1. убедиться, что PostgreSQL запущен
2. создать .env файл на основании .env.example и указать в нём DATABASE_URL
3. установить зависимости: python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
4. создать базу данных: .venv/bin/python -m scripts.create_db
5. запустить сервер: .venv/bin/fastapi run app/main.py
