const firebaseConfig = {
    apiKey: "AIzaSyCFl1OIYVJBMyr4CAVMLcDGU9evSanCuhg",
    authDomain: "student-survey-d366b.firebaseapp.com",
    databaseURL: "https://student-survey-d366b-default-rtdb.firebaseio.com",
    projectId: "student-survey-d366b",
    storageBucket: "student-survey-d366b.appspot.com",
    messagingSenderId: "511462276325",
    appId: "1:511462276325:web:8edab6570e8e8e71a5680c",
    measurementId: "G-F0ER919KS2"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);

// Функция для генерации уникального идентификатора пользователя
function generateUserId() {
    return uuidv4();
}

// Функция для перемешивания массива
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Функция для загрузки файла с пословицами
function loadFile(filePath) {
    return fetch(filePath)
        .then(response => response.text())
        .then(data => {
            return data.split('\n').filter(line => line.trim() !== '');
        });
}

let realProverbs = [];
let generatedProverbs = [];

// Глобальная переменная для хранения случайных вопросов
let quizProverbs = [];

// Функция для получения случайных пословиц
function getRandomProverbs() {
    let selectedReal = [];
    let selectedGenerated = [];

    while (selectedReal.length < 5) {
        let randomIndex = Math.floor(Math.random() * realProverbs.length);
        if (!selectedReal.includes(realProverbs[randomIndex])) {
            selectedReal.push(realProverbs[randomIndex]);
        }
    }

    while (selectedGenerated.length < 5) {
        let randomIndex = Math.floor(Math.random() * generatedProverbs.length);
        if (!selectedGenerated.includes(generatedProverbs[randomIndex])) {
            selectedGenerated.push(generatedProverbs[randomIndex]);
        }
    }

    const combined = selectedReal.map(p => ({ proverb: p, isGenerated: false }))
        .concat(selectedGenerated.map(p => ({ proverb: p, isGenerated: true })));

    quizProverbs = shuffle(combined); // Сохраняем случайные вопросы

    return quizProverbs;
}

// Функция для генерации опроса
function generateQuiz() {
    const quizDiv = document.getElementById('quiz');
    const proverbs = getRandomProverbs();

    proverbs.forEach((proverbObj, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.innerHTML = `
            <p>${index + 1}) Это пословица сгенерированная?</p>
            <p>"${proverbObj.proverb}"</p>
            <input type="radio" name="q${index + 1}" value="true">Да
            <input type="radio" name="q${index + 1}" value="false">Нет
        `;
        quizDiv.appendChild(questionDiv);
    });
}

// Функция для проверки, что все вопросы были отвечены
function isAllQuestionsAnswered() {
    for (let i = 1; i <= 10; i++) {
        const checked = document.querySelector(`input[name="q${i}"]:checked`);
        if (!checked) {
            return false;
        }
    }
    return true;
}

// Функция для отправки результатов опроса
function submitQuiz() {
    if (!isAllQuestionsAnswered()) {
        alert("Пожалуйста, ответьте на все вопросы перед отправкой опроса.");
        return;
    }

    const responses = [];
    let correctAnswers = 0;

    for (let i = 0; i < 10; i++) {
        const value = document.querySelector(`input[name="q${i + 1}"]:checked`).value;
        const isCorrect = (value === "true" && quizProverbs[i].isGenerated) ||
            (value === "false" && !quizProverbs[i].isGenerated);

        if (isCorrect) correctAnswers++;

        responses.push({
            proverb: quizProverbs[i].proverb,
            userAnswer: value === "true",
            correctAnswer: quizProverbs[i].isGenerated,
            isCorrect
        });
    }

    const quizDiv = document.getElementById('quiz');
    const submitButton = document.querySelector('button');
    quizDiv.style.display = 'none';
    submitButton.style.display = 'none';

    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.style.textAlign = 'center';

    resultDiv.innerHTML = `
        <p>Правильные ответы: ${correctAnswers} из 10</p>
        <p>Спасибо за участие в опросе!</p>
    `;

    const database = firebase.database();
    const userId = generateUserId();
    const quizDataRef = database.ref(`quiz_results/${userId}`);

    quizDataRef.set({
        correctAnswers: correctAnswers,
        responses: responses,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    })
        .then(() => {
            console.log('Ответы успешно отправлены в Firebase!');
        })
        .catch(error => {
            console.error('Ошибка при отправке ответов в Firebase:', error);
        });

    console.log(`Правильные ответы: ${correctAnswers} из 10`);
    console.log(responses);
}

// Загрузка файлов с пословицами
Promise.all([
    loadFile('proverbs/mixed_proverbs.txt'),
    loadFile('proverbs/mixed_generated_proverbs.txt')
])
    .then(results => {
        realProverbs = results[0];
        generatedProverbs = results[1];
        generateQuiz();
    })
    .catch(error => {
        console.error("Ошибка при загрузке файлов:", error);
    });