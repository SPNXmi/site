from flask import Flask, render_template, request, jsonify
import os
import json

app = Flask(__name__)

# Загрузка вопросов викторины
def load_questions():
    with open('data/questions.json', 'r', encoding='utf-8') as f:
        return json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

# API для получения вопросов
@app.route('/api/questions')
def get_questions():
    return jsonify(load_questions())

# API для сохранения результатов
@app.route('/api/save-score', methods=['POST'])
def save_score():
    data = request.json
    user_id = data.get('user_id')
    score = data.get('score')
    correct = data.get('correct')
    total = data.get('total')
    
    # Здесь можно добавить сохранение в БД
    print(f"Сохранение результата: Пользователь {user_id} - {score} очков ({correct}/{total})")
    
    return jsonify({
        'status': 'success',
        'message': f'Результат сохранен: {score} очков'
    })

# Вебхук для инициализации бота (опционально)
@app.route('/webhook', methods=['POST'])
def webhook():
    # Обработка входящих сообщений от Telegram
    return jsonify({'status': 'ok'})

if name == '__main__':
    # Для публикации используйте: waitress-serve --port=5000 app:app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)