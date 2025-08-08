
// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Получение данных пользователя
const user = tg.initDataUnsafe.user || {};
const userId = user.id || 'guest_' + Math.random().toString(36).substr(2, 9);

// Элементы интерфейса
const gameScreen = document.getElementById('gameScreen');
const resultScreen = document.getElementById('resultScreen');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const nextBtn = document.getElementById('nextBtn');
const hintBtn = document.getElementById('hintBtn');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const scoreValue = document.getElementById('scoreValue');
const levelValue = document.getElementById('levelValue');
const streakValue = document.getElementById('streakValue');
const finalScore = document.getElementById('finalScore');
const correctAnswers = document.getElementById('correctAnswers');
const totalQuestions = document.getElementById('totalQuestions');
const shareBtn = document.getElementById('shareBtn');
const restartBtn = document.getElementById('restartBtn');

// Игровые переменные
let quizData = [];
let currentQuestion = 0;
let score = 0;
let correctCount = 0;
let answerStreak = 0;
let selectedOption = -1;
let hintUsed = false;

// Загрузка вопросов с сервера
async function loadQuestions() {
    try {
        const response = await fetch('/api/questions');
        quizData = await response.json();
        initGame();
    } catch (error) {
        questionText.textContent = 'Ошибка загрузки вопросов. Пожалуйста, попробуйте позже.';
        console.error('Ошибка загрузки вопросов:', error);
    }
}

// Инициализация игры
function initGame() {
    currentQuestion = 0;
    score = 0;
    correctCount = 0;
    answerStreak = 0;
    updateScore();
    showQuestion();
}

// Показать текущий вопрос
function showQuestion() {
    const question = quizData[currentQuestion];
    questionText.textContent = question.question;
    optionsContainer.innerHTML = '';
    hintUsed = false;
    hintBtn.disabled = false;
    nextBtn.disabled = true;
    selectedOption = -1;
    
    // Создание кнопок с вариантами ответов
    question.options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.classList.add('option-btn');
        optionBtn.innerHTML = `
            <div class="option-letter">${String.fromCharCode(65 + index)}</div>
            <div class="option-text">${option}</div>
        `;
        
        optionBtn.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionBtn);
    });
    
    // Обновление прогресса
    progressText.textContent = ${currentQuestion + 1}/${quizData.length};
    progressFill.style.width = ${((currentQuestion) / quizData.length) * 100}%;
}

// Выбор варианта ответа
function selectOption(index) {
    if (selectedOption !== -1) return;
    
    selectedOption = index;
    const options = document.querySelectorAll('.option-btn');
    const question = quizData[currentQuestion];
    
    // Пометить выбранный вариант
    options[index].style.background = 'rgba(255, 255, 255, 0.2)';
    options[index].style.boxShadow = '0 0 15px rgba(106, 90, 249, 0.5)';
    
    // Проверить ответ
    const isCorrect = index === question.correct;
    
    // Показать правильный ответ
    options[question.correct].style.background = 'rgba(0, 184, 148, 0.3)';
    options[question.correct].style.boxShadow = '0 0 15px rgba(0, 184, 148, 0.5)';
    
    // Пометить неправильный выбор
    if (!isCorrect) {
        options[index].style.background = 'rgba(255, 118, 117, 0.3)';
        options[index].style.boxShadow = '0 0 15px rgba(255, 118, 117, 0.5)';
        answerStreak = 0;
    } else {
        score += hintUsed ? 5 : 10;
        correctCount++;
        answerStreak++;
        
        // Бонус за серию
        if (answerStreak >= 3) {
            score += 5;

ᅠ ᅠ, [08/08/2025 17:50]
}
    }
    
    // Обновить статистику
    updateScore();
    nextBtn.disabled = false;
}

// Обновление статистики
function updateScore() {
    scoreValue.textContent = score;
    streakValue.textContent = answerStreak;
    levelValue.textContent = Math.floor(score / 50) + 1;
}

// Показать подсказку
function showHint() {
    if (hintUsed || selectedOption !== -1) return;
    
    const question = quizData[currentQuestion];
    tg.showPopup({
        title: 'Подсказка',
        message: question.hint,
        buttons: [{ type: 'ok' }]
    });
    
    hintUsed = true;
    hintBtn.disabled = true;
}

// Перейти к следующему вопросу
function nextQuestion() {
    currentQuestion++;
    
    if (currentQuestion < quizData.length) {
        showQuestion();
    } else {
        showResults();
    }
}

// Показать результаты
function showResults() {
    gameScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    finalScore.textContent = score;
    correctAnswers.textContent = correctCount;
    totalQuestions.textContent = quizData.length;
    
    // Сохранение результата на сервере
    saveScore();
    
    // Создать конфетти
    createConfetti();
}

// Сохранение результата
async function saveScore() {
    try {
        const response = await fetch('/api/save-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                score: score,
                correct: correctCount,
                total: quizData.length,
                username: user.username || 'Гость'
            })
        });
        
        const result = await response.json();
        console.log(result.message);
    } catch (error) {
        console.error('Ошибка сохранения результата:', error);
    }
}

// Создать эффект конфетти
function createConfetti() {
    const colors = ['#6a5af9', '#d66efd', '#00cec9', '#00b894', '#fdcb6e'];
    const container = document.body;
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = ${Math.random() * 100}vw;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.opacity = '1';
        
        container.appendChild(confetti);
        
        // Анимация падения
        const animation = confetti.animate([
            { top: '-10px', transform: 'rotate(0deg)' },
            { top: '100vh', transform: 'rotate(720deg)' }
        ], {
            duration: 3000 + Math.random() * 3000,
            easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
        });
        
        // Удалить после анимации
        animation.onfinish = () => confetti.remove();
    }
}

// Поделиться результатом
function shareResults() {
    tg.showPopup({
        title: 'Поделиться результатом',
        message: Я набрал ${score} очков в викторине BrainQuest! Попробуй и ты!,
        buttons: [{ type: 'default', text: 'Поделиться' }]
    }, () => {
        tg.sendData(JSON.stringify({
            action: "share",
            score: score,
            url: window.location.href
        }));
    });
}

// Перезапустить игру
function restartGame() {
    gameScreen.classList.remove('hidden');
    resultScreen.classList.add('hidden');
    loadQuestions();
}

// Назначение обработчиков событий
document.addEventListener('DOMContentLoaded', () => {
    nextBtn.addEventListener('click', nextQuestion);
    hintBtn.addEventListener('click', showHint);
    shareBtn.addEventListener('click', shareResults);
    restartBtn.addEventListener('click', restartGame);
    
    // Инициализация приложения
    loadQuestions();
});

// Отправка данных в бота при закрытии
tg.onEvent('viewportChanged', () => {
    if (tg.isClosingConfirmationEnabled) {
        tg.sendData(JSON.stringify({ 
            action: "close_app", 
            score: score,
            correct: correctCount,
            total: quizData.length
        }));
    }
});