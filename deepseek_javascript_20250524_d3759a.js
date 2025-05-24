// Dados dos casos clínicos (pode ser substituído por um arquivo JSON ou API)
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
            { name: "Plaquetas", value: "280.000/mm³ (normal)", hint: "Sem alteração" },
            { name: "Bilirrubina total", value: "0.8 mg/dL (normal)", hint: "Sem alteração" },
            { name: "Transferrina", value: "450 mg/dL (alto)", hint: "Deficiência de ferro" }
        ],
        correctDiagnosis: "anemia ferropriva",
        labInstructions: "Dirija-se ao laboratório 208 para realizar um esfregaço sanguíneo e coloração pelo método Panótico. Identifique as características morfológicas das hemácias.",
        labQuestions: [
            {
                question: "Descreva as alterações morfológicas observadas no esfregaço:",
                answer: "microcitose, hipocromia, anisocitose e poiquilocitose"
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
            { name: "Plaquetas", value: "320.000/mm³ (normal)", hint: "Sem alteração" },
            { name: "PCR", value: "2.5 mg/dL (alto)", hint: "Processo inflamatório" },
            { name: "Albumina", value: "3.0 g/dL (baixo)", hint: "Hipoalbuminemia" },
            { name: "Exame físico", value: "Hepatomegalia discreta", hint: "Possível comprometimento hepático" },
            { name: "Fezes - aspecto", value: "Mucossanguinolentas", hint: "Colite" },
            { name: "Fezes - pH", value: "6.8 (normal)", hint: "Sem alteração" },
            { name: "Fezes - subst red", value: "Positivo", hint: "Sangramento digestivo" }
        ],
        correctDiagnosis: "disenteria amebiana",
        labInstructions: "Dirija-se ao laboratório 208 para examinar a amostra de fezes e identificar o parasita causador.",
        labQuestions: [
            {
                question: "Identifique o parasita observado no exame de fezes:",
                answer: "entamoeba histolytica"
            },
            {
                question: "Descreva as formas observadas:",
                answer: "trofozoítos com hemácias fagocitadas"
            }
        ]
    },
    // Adicionar mais casos para outras áreas (Microbiologia e Bioquímica Clínica)
];

// Variáveis de estado
let currentCaseIndex = 0;
let selectedParameters = [];
let startTime;
let timerInterval;
let score = 0;
let labAnswers = {};

// Elementos DOM
const caseScreen = document.getElementById('case-screen');
const parametersScreen = document.getElementById('parameters-screen');
const diagnosisScreen = document.getElementById('diagnosis-screen');
const labScreen = document.getElementById('lab-screen');
const resultsScreen = document.getElementById('results-screen');

const caseTitle = document.getElementById('case-title');
const caseImage = document.getElementById('case-image');
const caseDescription = document.getElementById('case-description');
const parametersList = document.getElementById('parameters-list');
const parametersResults = document.getElementById('parameters-results');
const diagnosisInput = document.getElementById('diagnosis-input');
const diagnosisFeedback = document.getElementById('diagnosis-feedback');
const labInstructions = document.getElementById('lab-instructions');
const labQuestionsContainer = document.getElementById('lab-questions');
const completeLabBtn = document.getElementById('complete-lab-btn');
const finalResults = document.getElementById('final-results');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');

// Funções
function startTimer() {
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const currentTime = new Date();
    const elapsedTime = new Date(currentTime - startTime);
    const minutes = elapsedTime.getMinutes().toString().padStart(2, '0');
    const seconds = elapsedTime.getSeconds().toString().padStart(2, '0');
    timerDisplay.textContent = `Tempo: ${minutes}:${seconds}`;
}

function stopTimer() {
    clearInterval(timerInterval);
}

function calculateScore(caseIndex, timeTaken, attempts) {
    const baseScore = 1000;
    const timePenalty = Math.floor(timeTaken / 10); // 1 ponto a cada 10 segundos
    const attemptPenalty = (attempts - 1) * 100;
    return Math.max(0, baseScore - timePenalty - attemptPenalty);
}

function loadCase(caseIndex) {
    if (caseIndex >= clinicalCases.length) {
        // Fim dos casos
        showFinalResults();
        return;
    }

    const currentCase = clinicalCases[caseIndex];
    
    // Resetar estado
    selectedParameters = [];
    labAnswers = {};
    stopTimer();
    startTimer();
    
    // Atualizar UI
    caseTitle.textContent = currentCase.title;
    caseDescription.textContent = currentCase.description;
    
    // Mostrar imagem apenas se não for Bioquímica Clínica
    const imageContainer = document.getElementById('case-image-container');
    if (currentCase.area === "Bioquímica Clínica") {
        imageContainer.style.display = 'none';
    } else {
        imageContainer.style.display = 'flex';
        caseImage.src = currentCase.image;
        caseImage.alt = `Imagem de ${currentCase.area}`;
    }
    
    // Mostrar tela inicial do caso
    showScreen('case-screen');
}

function showScreen(screenId) {
    // Esconder todas as telas
    caseScreen.classList.add('hidden');
    parametersScreen.classList.add('hidden');
    diagnosisScreen.classList.add('hidden');
    labScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    
    // Mostrar a tela desejada
    document.getElementById(screenId).classList.remove('hidden');
}

function showParametersScreen() {
    const currentCase = clinicalCases[currentCaseIndex];
    
    // Limpar lista de parâmetros
    parametersList.innerHTML = '';
    
    // Adicionar parâmetros à lista
    currentCase.parameters.forEach((param, index) => {
        const paramElement = document.createElement('div');
        paramElement.className = 'parameter-item';
        paramElement.textContent = param.name;
        paramElement.dataset.index = index;
        
        paramElement.addEventListener('click', () => {
            toggleParameterSelection(paramElement, index);
        });
        
        parametersList.appendChild(paramElement);
    });
    
    showScreen('parameters-screen');
}

function toggleParameterSelection(element, paramIndex) {
    const index = selectedParameters.indexOf(paramIndex);
    
    if (index === -1) {
        // Adicionar parâmetro se ainda não estiver selecionado e não tiver 3 já selecionados
        if (selectedParameters.length < 3) {
            selectedParameters.push(paramIndex);
            element.classList.add('selected');
        }
    } else {
        // Remover parâmetro
        selectedParameters.splice(index, 1);
        element.classList.remove('selected');
    }
    
    // Habilitar/desabilitar botão de confirmação
    document.getElementById('confirm-parameters-btn').disabled = selectedParameters.length !== 3;
}

function showDiagnosisScreen() {
    const currentCase = clinicalCases[currentCaseIndex];
    
    // Mostrar resultados dos parâmetros selecionados
    parametersResults.innerHTML = '<h3>Resultados dos Exames:</h3>';
    
    selectedParameters.forEach(paramIndex => {
        const param = currentCase.parameters[paramIndex];
        const paramElement = document.createElement('div');
        paramElement.innerHTML = `<strong>${param.name}:</strong> ${param.value}`;
        parametersResults.appendChild(paramElement);
    });
    
    // Resetar input e feedback
    diagnosisInput.value = '';
    diagnosisFeedback.textContent = '';
    diagnosisFeedback.className = 'feedback';
    
    showScreen('diagnosis-screen');
}

function checkDiagnosis() {
    const userDiagnosis = diagnosisInput.value.trim().toLowerCase();
    const correctDiagnosis = clinicalCases[currentCaseIndex].correctDiagnosis;
    
    if (userDiagnosis === correctDiagnosis) {
        // Diagnóstico correto
        diagnosisFeedback.textContent = 'Parabéns! Diagnóstico correto.';
        diagnosisFeedback.className = 'feedback correct';
        
        // Mostrar instruções para o laboratório
        showLabScreen();
    } else {
        // Diagnóstico incorreto
        diagnosisFeedback.textContent = 'Diagnóstico incorreto. Tente novamente após 1 minuto.';
        diagnosisFeedback.className = 'feedback incorrect';
        
        // Desabilitar botão por 1 minuto
        const submitBtn = document.getElementById('submit-diagnosis-btn');
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.disabled = false;
            diagnosisFeedback.textContent += ' Você pode tentar novamente agora.';
        }, 60000);
    }
}

function showLabScreen() {
    const currentCase = clinicalCases[currentCaseIndex];
    
    // Mostrar instruções do laboratório
    labInstructions.innerHTML = `
        <h3>Instruções para a Prova Laboratorial</h3>
        <p>${currentCase.labInstructions}</p>
        <p>Quando estiver pronto, clique no botão abaixo para responder as questões.</p>
    `;
    
    // Configurar botão para mostrar questões
    completeLabBtn.classList.add('hidden');
    const startLabBtn = document.createElement('button');
    startLabBtn.className = 'btn';
    startLabBtn.textContent = 'Iniciar Prova Laboratorial';
    startLabBtn.addEventListener('click', () => {
        startLabBtn.remove();
        setupLabQuestions();
    });
    labInstructions.appendChild(startLabBtn);
    
    showScreen('lab-screen');
}

function setupLabQuestions() {
    const currentCase = clinicalCases[currentCaseIndex];
    
    // Limpar questões anteriores
    labQuestionsContainer.innerHTML = '';
    
    // Adicionar questões
    currentCase.labQuestions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'lab-question';
        questionElement.innerHTML = `
            <p><strong>Questão ${index + 1}:</strong> ${question.question}</p>
            <input type="text" id="lab-answer-${index}" placeholder="Sua resposta">
        `;
        labQuestionsContainer.appendChild(questionElement);
    });
    
    // Mostrar questões e botão de conclusão
    labQuestionsContainer.classList.remove('hidden');
    completeLabBtn.classList.remove('hidden');
    
    // Configurar evento do botão de conclusão
    completeLabBtn.onclick = completeLabTest;
}

function completeLabTest() {
    const currentCase = clinicalCases[currentCaseIndex];
    let allAnswered = true;
    
    // Verificar respostas
    currentCase.labQuestions.forEach((question, index) => {
        const answerInput = document.getElementById(`lab-answer-${index}`);
        const userAnswer = answerInput.value.trim().toLowerCase();
        
        if (userAnswer === '') {
            allAnswered = false;
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
    
    // Calcular pontuação e mostrar resultados
    showResultsScreen();
}

function showResultsScreen() {
    const currentCase = clinicalCases[currentCaseIndex];
    stopTimer();
    
    // Calcular tempo decorrido em segundos
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(timeTaken / 60).toString().padStart(2, '0');
    const seconds = (timeTaken % 60).toString().padStart(2, '0');
    
    // Calcular pontuação (simplificado)
    const caseScore = calculateScore(currentCaseIndex, timeTaken, 1); // Assumindo 1 tentativa por enquanto
    score += caseScore;
    
    // Atualizar pontuação total
    scoreDisplay.textContent = `Pontuação: ${score}`;
    
    // Mostrar resultados
    finalResults.innerHTML = `
        <h3>Caso Concluído: ${currentCase.title}</h3>
        <p>Tempo gasto: ${minutes}:${seconds}</p>
        <p>Pontuação deste caso: ${caseScore}</p>
        <p>Pontuação total: ${score}</p>
        
        <h4>Resumo das Respostas Laboratoriais:</h4>
    `;
    
    // Adicionar resultados das questões do laboratório
    Object.keys(labAnswers).forEach(key => {
        const answer = labAnswers[key];
        finalResults.innerHTML += `
            <div class="lab-answer ${answer.isCorrect ? 'correct' : 'incorrect'}">
                <p><strong>Questão:</strong> ${answer.question}</p>
                <p><strong>Sua resposta:</strong> ${answer.userAnswer}</p>
                ${!answer.isCorrect ? `<p><strong>Resposta correta:</strong> ${answer.correctAnswer}</p>` : ''}
            </div>
        `;
    });
    
    showScreen('results-screen');
}

function showFinalResults() {
    // Tela final com todos os resultados
    finalResults.innerHTML = `
        <h3>Gincana Concluída!</h3>
        <p>Pontuação final: ${score}</p>
        <p>Parabéns por completar todos os casos clínicos!</p>
    `;
    
    // Alterar botão para reiniciar
    const nextCaseBtn = document.getElementById('next-case-btn');
    nextCaseBtn.textContent = 'Reiniciar Gincana';
    nextCaseBtn.onclick = () => {
        currentCaseIndex = 0;
        score = 0;
        scoreDisplay.textContent = `Pontuação: 0`;
        loadCase(0);
    };
    
    showScreen('results-screen');
}

// Event Listeners
document.getElementById('start-case-btn').addEventListener('click', showParametersScreen);
document.getElementById('confirm-parameters-btn').addEventListener('click', showDiagnosisScreen);
document.getElementById('submit-diagnosis-btn').addEventListener('click', checkDiagnosis);

document.getElementById('next-case-btn').addEventListener('click', () => {
    currentCaseIndex++;
    loadCase(currentCaseIndex);
});

// Iniciar o primeiro caso ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    loadCase(0);
});