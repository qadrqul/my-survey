function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function loadFile(filePath) {
    return fetch(filePath)
        .then(response => response.text())
        .then(data => {
            return data.split('\n').filter(line => line.trim() !== '');
        });
}

let realProverbs = [];
let generatedProverbs = [];

function getRandomProverbs() {
    let selectedReal = [];
    let selectedGenerated = [];

    while(selectedReal.length < 5) {
        let randomIndex = Math.floor(Math.random() * realProverbs.length);
        if(!selectedReal.includes(realProverbs[randomIndex])) {
            selectedReal.push(realProverbs[randomIndex]);
        }
    }

    while(selectedGenerated.length < 5) {
        let randomIndex = Math.floor(Math.random() * generatedProverbs.length);
        if(!selectedGenerated.includes(generatedProverbs[randomIndex])) {
            selectedGenerated.push(generatedProverbs[randomIndex]);
        }
    }

    const combined = selectedReal.map(p => ({proverb: p, isGenerated: false}))
        .concat(selectedGenerated.map(p => ({proverb: p, isGenerated: true})));

    return shuffle(combined);
}

function generateQuiz() {
    const quizDiv = document.getElementById('quiz');
    const proverbs = getRandomProverbs();

    proverbs.forEach((proverbObj, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.innerHTML = `
            <p>${index+1}. Это пословица сгенерированная?</p>
            <p>"${proverbObj.proverb}"</p>
            <input type="radio" name="q${index + 3}" value="true">Да
            <input type="radio" name="q${index + 3}" value="false">Нет
        `;
        quizDiv.appendChild(questionDiv);
    });
}

function isAllQuestionsAnswered() {
    for (let i = 3; i < 13; i++) {
        const checked = document.querySelector(`input[name="q${i}"]:checked`);
        if (!checked) {
            return false;
        }
    }
    return true;
}

function submitQuiz() {
    if (!isAllQuestionsAnswered()) {
        alert("Пожалуйста, ответьте на все вопросы перед отправкой опроса.");
        return;
    }

    const responses = [];
    let correctAnswers = 0;

    const proverbs = getRandomProverbs();

    for(let i = 0; i < 10; i++) {
        const value = document.querySelector(`input[name="q${i + 3}"]:checked`).value;
        const isCorrect = (value === "true" && proverbs[i].isGenerated) ||
            (value === "false" && !proverbs[i].isGenerated);

        if (isCorrect) correctAnswers++;

        responses.push({
            proverb: proverbs[i].proverb,
            userAnswer: value === "true",
            correctAnswer: proverbs[i].isGenerated,
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

    console.log(`Правильные ответы: ${correctAnswers} из 10`);
    console.log(responses);
}

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
