// Dados dos casos clínicos
const clinicalCases = [
    {
        id: 1,
        area: "Hematologia",
        title: "Caso Hematológico #1",
        image: "assets/images/hematologia1.jpg",
        description: "Paciente de 32 anos, sexo feminino, apresenta fadiga intensa, palidez cutâneo-mucosa e dispneia aos esforços. Ao exame físico, notam-se unhas quebradiças e queilite angular.",
        parameters: [
            { name: "Hemoglobina", value: "6.8 g/dL (baixo)", hint: "Anemia grave" },
            { name: "Hematócrito", value: "22% (baixo)", hint: "Anemia grave" },
            { name: "VCM", value: "65 fL (baixo)", hint: "Microcitose" },
            { name: "RDW", value: "18% (alto)", hint: "Anisocitose" },
            { name: "Ferro sérico", value: "25 µg/dL (baixo)", hint: "Deficiência de ferro" },
            { name: "Ferritina", value: "8 ng/mL (baixo)", hint: "Deficiência de ferro" },
            { name: "Leucócitos", value: "6.500/mm³ (normal)", hint: "Sem alteração" },
            { name: "Plaquetas", value: "280.000/mm³ (normal)", hint: "Sem alteração" }
        ],
        correctDiagnosis: "anemia ferropriva",
        labInstructions: "Dirija-se ao laboratório 208 para realizar um esfregaço sanguíneo e coloração pelo método Panótico. Identifique as características morfológicas das hemácias.",
        labQuestions: [
            {
                question: "Descreva as alterações morfológicas observadas no esfregaço:",
                answer: "microcitose, hipocromia, anisocitose"
            }
        ]
    },
    {
        id: 2,
        area: "Parasitologia",
        title: "Caso Parasitológico #1",
        image: "assets/images/parasitologia1.jpg",
        description: "Criança de 7 anos, sexo masculino, proveniente de área rural, apresenta dor abdominal difusa, diarreia mucossanguinolenta e tenesmo há 3 dias. Refere perda de peso nos últimos 2 meses.",
        parameters: [
            { name: "Hemoglobina", value: "10.2 g/dL (baixo)", hint: "Anemia leve" },
            { name: "Leucócitos", value: "11.200/mm³ (alto)", hint: "Leucocitose" },
            { name: "Eosinófilos", value: "8% (alto)", hint: "Eosinofilia" },
            { name: "Fezes - aspecto", value: "Mucossanguinolentas", hint: "Colite" },
            { name: "Fezes - subst red", value: "Positivo", hint: "Sangramento digestivo" },
            { name: "PCR", value: "2.5 mg/dL (alto)", hint: "Processo inflamatório" }
        ],
        correctDiagnosis: "disenteria amebiana",
        labInstructions: "Dirija-se ao laboratório 208 para examinar a amostra de fezes e identificar o parasita causador.",
        labQuestions: [
            {
                question: "Identifique o parasita observado no exame de fezes:",
                answer: "entamoeba histolytica"
            }
        ]
    }
];

// Variáveis de estado
let currentCaseIndex = 0;
let selectedParameters = [];
let startTime;
let timerInterval;
let score = 0;
let labAnswers = {};
let attempts = 1;

// Elementos DOM
const elements = {
    caseScreen: document.getElementById('case-screen'),
    parametersScreen: document.getElementById('parameters-screen'),
    diagnosisScreen: document.getElementById('diagnosis-screen'),
    labScreen: document.getElementById('lab-screen'),
    resultsScreen: document.getElementById('results-screen'),
    loadingScreen: document.getElementById('loading-screen'),
    caseTitle: document.getElementById('case-title'),
    caseImage: document.getElementById('case-image'),
    caseDescription: document.getElementById('case-description'),
    parametersList: document.getElementById('parameters-list'),
    parametersResults: document.getElementById('parameters-results'),
    diagnosisInput: document.getElementById('diagnosis-input'),
    diagnosisFeedback: document.getElementById('diagnosis-feedback'),
    labInstructions: document.getElementById('lab-instructions'),
    labQuestionsContainer: document.getElementById('lab-questions'),
    completeLabBtn: document.getElementById('complete-lab-btn'),
    finalResults: document.getElementById('final-results'),
    timerDisplay: document.getElementById('timer'),
    scoreDisplay: document.getElementById('score'),
    startCaseBtn: document.getElementById('start-case-btn'),
    confirmParametersBtn: document.getElementById('confirm-parameters-btn'),
    submitDiagnosisBtn: document.getElementById('submit-diagnosis-btn'),
    nextCaseBtn: document.getElementById('next-case-btn')
};

// Funções
function startTimer() {
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const currentTime = new Date();
    const elapsedTime = new Date(currentTime - startTime);
    const minutes = elapsedTime.getUTCMinutes().toString().padStart(2, '0');
    const seconds = elapsedTime.getUTCSeconds().toString().padStart(2, '0');
    elements.timerDisplay.textContent = `Tempo: ${minutes}:${seconds}`;
}

function stopTimer() {
    clearInterval(timerInterval);
}

function calculateScore(timeTaken) {
    const baseScore = 1000;
    const timePenalty = Math.floor(timeTaken / 5);
    const attemptPenalty = (attempts - 1) * 150;
    return Math.max(100, baseScore - timePenalty - attemptPenalty);
}

function showScreen(screenId) {
    // Esconder todas as telas
    Object.values(elements).forEach(el => {
        if (el.classList && el.classList.contains('screen')) {
            el.classList.add('hidden');
        }
    });
    
    // Mostrar a tela desejada
    if (elements[screenId]) {
        elements[screenId].classList.remove('hidden');
    }
}

function loadCase(caseIndex) {
    if (caseIndex >= clinicalCases.length) {
        showFinalResults();
        return;
    }

    showScreen('loading-screen');
    
    setTimeout(() => {
        const currentCase = clinicalCases[caseIndex];
        resetCaseState();
        startTimer();
        
        elements.caseTitle.textContent = currentCase.title;
        elements.caseDescription.textContent = currentCase.description;
        
        const imageContainer = document.getElementById('case-image-container');
        if (currentCase.area === "Bioquímica Clínica") {
            imageContainer.style.display = 'none';
        } else {
            imageContainer.style.display = 'flex';
            elements.caseImage.src = currentCase.image || '';
            elements.caseImage.alt = `Imagem de ${currentCase.area}`;
        }
        
        showScreen('case-screen');
    }, 500);
}

function showParametersScreen() {
    const currentCase = clinicalCases[currentCaseIndex];
    elements.parametersList.innerHTML = '';
    
    currentCase.parameters.forEach((param, index) => {
        const paramElement = document.createElement('div');
        paramElement.className = 'parameter-item';
        paramElement.textContent = param.name;
        paramElement.dataset.index = index;
        
        paramElement.addEventListener('click', () => {
            toggleParameterSelection(paramElement, index);
        });
        
        elements.parametersList.appendChild(paramElement);
    });
    
    showScreen('parameters-screen');
}

function toggleParameterSelection(element, paramIndex) {
    const index = selectedParameters.indexOf(paramIndex);
    
    if (index === -1) {
        if (selectedParameters.length < 3) {
            selectedParameters.push(paramIndex);
            element.classList.add('selected');
        }
    } else {
        selectedParameters.splice(index, 1);
        element.classList.remove('selected');
    }
    
    elements.confirmParametersBtn.disabled = selectedParameters.length !== 3;
}

function showDiagnosisScreen() {
    const currentCase = clinicalCases[currentCaseIndex];
    elements.parametersResults.innerHTML = '<h3>Resultados dos Exames:</h3>';
    
    selectedParameters.forEach(paramIndex => {
        const param = currentCase.parameters[paramIndex];
        const paramElement = document.createElement('div');
        paramElement.innerHTML = `<strong>${param.name}:</strong> ${param.value}`;
        elements.parametersResults.appendChild(paramElement);
    });
    
    elements.diagnosisInput.value = '';
    elements.diagnosisFeedback.textContent = '';
    elements.diagnosisFeedback.className = 'feedback';
    
    showScreen('diagnosis-screen');
}

function checkDiagnosis() {
    const userDiagnosis = elements.diagnosisInput.value.trim().toLowerCase();
    const correctDiagnosis = clinicalCases[currentCaseIndex].correctDiagnosis;
    
    if (userDiagnosis === correctDiagnosis) {
        elements.diagnosisFeedback.textContent = 'Parabéns! Diagnóstico correto.';
        elements.diagnosisFeedback.className = 'feedback correct';
        showLabScreen();
    } else {
        attempts++;
        elements.diagnosisFeedback.textContent = 'Diagnóstico incorreto. Tente novamente após 1 minuto.';
        elements.diagnosisFeedback.className = 'feedback incorrect';
        elements.submitDiagnosisBtn.disabled = true;
        
        setTimeout(() => {
            elements.submitDiagnosisBtn.disabled = false;
            elements.diagnosisFeedback.textContent = 'Você pode tentar novamente agora.';
        }, 60000);
    }
}

function showLabScreen() {
    const currentCase = clinicalCases[currentCaseIndex];
    elements.labInstructions.innerHTML = `
        <h3>Instruções para a Prova Laboratorial</h3>
        <p>${currentCase.labInstructions}</p>
        <button id="start-lab-btn" class="btn">Iniciar Prova Laboratorial</button>
    `;
    
    document.getElementById('start-lab-btn').addEventListener('click', setupLabQuestions);
    showScreen('lab-screen');
}

function setupLabQuestions() {
    const currentCase = clinicalCases[currentCaseIndex];
    elements.labQuestionsContainer.innerHTML = '';
    
    currentCase.labQuestions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'lab-question';
        questionElement.innerHTML = `
            <p><strong>Questão ${index + 1}:</strong> ${question.question}</p>
            <input type="text" id="lab-answer-${index}" placeholder="Sua resposta">
        `;
        elements.labQuestionsContainer.appendChild(questionElement);
    });
    
    elements.labQuestionsContainer.classList.remove('hidden');
    elements.completeLabBtn.classList.remove('hidden');
    elements.labInstructions.innerHTML = `<h3>${currentCase.title} - Prova Laboratorial</h3>`;
}

function completeLabTest() {
    const currentCase = clinicalCases[currentCaseIndex];
    let allAnswered = true;
    
    currentCase.labQuestions.forEach((question, index) => {
        const answerInput = document.getElementById(`lab-answer-${index}`);
        const userAnswer = answerInput.value.trim().toLowerCase();
        
        if (!userAnswer) {
            allAnswered = false;
            answerInput.style.borderColor = 'red';
            return;
        }
        
        labAnswers[index] = {
            question: question.question,
            userAnswer: userAnswer,
            correctAnswer: question.answer,
            isCorrect: userAnswer === question.answer.toLowerCase()
        };
    });
    
    if (!allAnswered) {
        alert('Por favor, responda todas as questões antes de concluir.');
        return;
    }
    
    showResultsScreen();
}

function showResultsScreen() {
    stopTimer();
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - startTime) / 1000);
    const caseScore = calculateScore(timeTaken);
    score += caseScore;
    
    elements.scoreDisplay.textContent = `Pontuação: ${score}`;
    elements.finalResults.innerHTML = `
        <h3>Caso Concluído: ${clinicalCases[currentCaseIndex].title}</h3>
        <p>Tempo gasto: ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s</p>
        <p>Tentativas: ${attempts}</p>
        <p>Pontuação deste caso: ${caseScore}</p>
        <h4>Resumo das Respostas Laboratoriais:</h4>
    `;
    
    Object.entries(labAnswers).forEach(([key, answer]) => {
        elements.finalResults.innerHTML += `
            <div class="lab-answer ${answer.isCorrect ? 'correct' : 'incorrect'}">
                <p><strong>${answer.question}</strong></p>
                <p>Sua resposta: ${answer.userAnswer}</p>
                ${!answer.isCorrect ? `<p>Resposta correta: ${answer.correctAnswer}</p>` : ''}
            </div>
        `;
    });
    
    showScreen('results-screen');
}

function showFinalResults() {
    elements.finalResults.innerHTML = `
        <h3>Gincana Concluída!</h3>
        <p>Pontuação final: ${score}</p>
        <p>Parabéns por completar todos os casos clínicos!</p>
    `;
    
    elements.nextCaseBtn.textContent = 'Reiniciar Gincana';
    elements.nextCaseBtn.onclick = () => {
        currentCaseIndex = 0;
        score = 0;
        elements.scoreDisplay.textContent = `Pontuação: 0`;
        loadCase(0);
    };
    
    showScreen('results-screen');
}

function resetCaseState() {
    selectedParameters = [];
    labAnswers = {};
    attempts = 1;
    elements.diagnosisInput.value = '';
    elements.diagnosisFeedback.textContent = '';
    elements.diagnosisFeedback.className = 'feedback';
}

// Event Listeners
elements.startCaseBtn.addEventListener('click', showParametersScreen);
elements.confirmParametersBtn.addEventListener('click', showDiagnosisScreen);
elements.submitDiagnosisBtn.addEventListener('click', checkDiagnosis);
elements.completeLabBtn.addEventListener('click', completeLabTest);
elements.nextCaseBtn.addEventListener('click', () => {
    currentCaseIndex++;
    loadCase(currentCaseIndex);
});

// Iniciar o aplicativo
window.addEventListener('DOMContentLoaded', () => {
    loadCase(0);
});