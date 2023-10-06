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
function loadFile(filePath, isQuiz = false) {
    return fetch(filePath)
        .then(response => response.text())
        .then(data => {
            if (isQuiz) {
                const questions = [];
                const lines = data.split('\n').filter(line => line.trim() !== '');
                for (let i = 0; i < lines.length; i += 4) {
                    questions.push({
                        question: lines[i],
                        answers: [lines[i+1], lines[i+2], lines[i+3]].map(a => a.replace('*', '')),
                        correctAnswerIndex: [lines[i+1], lines[i+2], lines[i+3]].findIndex(a => a.startsWith('*'))
                    });
                }
                return questions;
            } else {
                return data.split('\n').filter(line => line.trim() !== '');
            }
        });
}

let realProverbs = [];
let generatedProverbs = [];
let languageQuestions = [];
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

function generateLanguageQuiz() {
    const quizDiv = document.getElementById('language-questions-section');
    const selectedLanguageQuestions = shuffle(languageQuestions).slice(0, 3);

    selectedLanguageQuestions.forEach((questionObj, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.innerHTML = `
            <p>${questionObj.question}</p>
            ${questionObj.answers.map((answer, aIndex) => `
                <input type="radio" name="langQ${index + 1}" value="${aIndex}">${answer}
            `).join('')}
        `;
        quizDiv.appendChild(questionDiv);
    });
}

function generateQuiz() {
    generateLanguageQuiz();
    const proverbsQuizDiv = document.getElementById('proverbs-questions-section');
    const proverbs = getRandomProverbs();

    proverbs.forEach((proverbObj, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.innerHTML = `
            <p>${index + 1}) Төмөндөгү макал жасалмабы же чыныгыбы?</p>
            <p>"${proverbObj.proverb}"</p>
            <input type="radio" name="q${index + 1}" value="false">Чыныгы
            <input type="radio" name="q${index + 1}" value="true">Жасалма
        `;
        proverbsQuizDiv.appendChild(questionDiv);
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

function renderAnswers() {
    const answersDiv = document.getElementById('answers');
    let html = '<h2>Жооптор:</h2>';

    quizProverbs.forEach((proverbObj, index) => {
        const userAnswer = document.querySelector(`input[name="q${index + 1}"]:checked`).value === "true";
        const correctAnswer = proverbObj.isGenerated;

        html += `
            <p><strong>Макал-лакап:</strong> "${proverbObj.proverb}"</p>
            <p><strong>Сиздин жообуңуз:</strong> ${userAnswer ? 'Жасалма' : 'Чыныгы'}</p>
            <p><strong>Туура жооп:</strong> ${correctAnswer ? 'Жасалма' : 'Чыныгы'}</p>
            <hr>
        `;
    });

    answersDiv.innerHTML = html;
}

function toggleAnswers() {
    const answersDiv = document.getElementById('answers');
    const showAnswersButton = document.getElementById('show-answers-button');

    if (answersDiv.style.display === 'none' || answersDiv.style.display === '') {
        renderAnswers();
        answersDiv.style.display = 'block';
        showAnswersButton.innerText = 'Жоопторду жашыруу';
    } else {
        answersDiv.style.display = 'none';
        showAnswersButton.innerText = 'Туура жооптор';
    }
}


// Функция для отправки результатов опроса
// Функция для отправки результатов опроса
function submitQuiz() {
    if (!isAllQuestionsAnswered()) {
        alert("Сураныч, сурамжылоону тапшыруудан мурун бардык суроолорго жооп бериңиз!");
        return;
    }

    let languageCorrect = true; // Для отслеживания правильных ответов на языковые вопросы

    for (let i = 0; i < 3; i++) {
        const checkedValue = document.querySelector(`input[name="langQ${i + 1}"]:checked`);
        if (!checkedValue) {
            alert("Сураныч, сурамжылоону тапшыруудан мурун бардык суроолорго жооп бериңиз!");
            return;
        }
        const isCorrect = parseInt(checkedValue.value) === languageQuestions[i].correctAnswerIndex;
        if (!isCorrect) {
            languageCorrect = false;
            break; // Если хоть один ответ неверный, прерываем цикл
        }
    }
    const responses = [];
    let correctAnswers = 0;
    if (!languageCorrect) {
        alert("Сиз текшерүү суроолордун бирине туура эмес жооп бердиңиз. Жоопторуңуз жөнөтүлбөйт жана базада сакталбайт.");

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
        const submitButton = document.getElementById('submit-button');
        quizDiv.style.display = 'none';
        submitButton.style.display = 'none';

        const resultDiv = document.getElementById('result');
        resultDiv.style.display = 'block';
        resultDiv.style.textAlign = 'center';
        document.getElementById('show-answers-button').style.display = 'block';
        const percentageCorrectAnswers = (correctAnswers / 10) * 100;
        resultDiv.innerHTML = `
        <p>Туура жооптор: ${percentageCorrectAnswers}%</p>
        <p>Катышканыңыз үчүн рахмат!</p>
    `;
        return;
    }

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
    const submitButton = document.getElementById('submit-button');
    quizDiv.style.display = 'none';
    submitButton.style.display = 'none';

    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.style.textAlign = 'center';
    document.getElementById('show-answers-button').style.display = 'block';
    const percentageCorrectAnswers = (correctAnswers / 10) * 100;
    resultDiv.innerHTML = `
        <p>Туура жооптор: ${percentageCorrectAnswers}%</p>
        <p>Катышканыңыз үчүн рахмат!</p>
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
            console.log('Successfully submitted to Firebase!');
        })
        .catch(error => {
            console.error('Error sending responses to Firebase:', error);
        });

    console.log(`Туура жооптор: ${percentageCorrectAnswers}%`);
    console.log(responses);
}

function startQuiz() {
    document.getElementById('intro').style.display = 'none';
    document.getElementById('quiz').style.display = 'block';
    document.getElementById('submit-button').style.display = 'block';
}
// Загрузка файлов с пословицами
Promise.all([
    loadFile('files/questions.txt', true),
    loadFile('files/mixed_proverbs.txt'),
    loadFile('files/mixed_generated_proverbs.txt')
])
    .then(results => {
        languageQuestions = results[0];
        realProverbs = results[1];
        generatedProverbs = results[2];
        generateQuiz();
    })
    .catch(error => {
        console.error("Файлдарды көчүргөндө ката чыкты: ", error);
    });
