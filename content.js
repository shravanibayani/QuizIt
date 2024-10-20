let quizData = [];
let currentQuestionIndex = 0;
let score = 0;

let questionText, quizContainer, optionsContainer, scorecard, nextButton;
const quizBox = document.createElement("div");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === "checkScript") {
    sendResponse({ status: "Content script is running" });
    return;
  }

  if (request.action === "showQuizBox") {
    console.log("Displaying floating quiz box.");

    // Prevent adding multiple quiz boxes
    if (document.querySelector(".quizbox")) {
      console.log("Quiz box is already displayed.");
      sendResponse({ status: "Quiz box already displayed" });
      return;
    }

    // Inject dynamic CSS if not already present
    if (!document.querySelector("link[data-injected='true']")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = chrome.runtime.getURL("quizBox.css");
      link.setAttribute("data-injected", "true");
      document.head.appendChild(link);
    }

    //floating quiz box
    quizBox.className = "quizbox";
    document.body.appendChild(quizBox);
    fetchNewQuiz();
    return true; 
  }
});


function initializeQuiz(quizBox, generating, loadVideo) {
  
  generating.style.display = "none";
  loadVideo.style.display = "none";
  quizBox.classList.remove("gap-5");

  questionText = createParagraph("", "question_text");
  quizContainer = createParagraph("", "quiz");
  optionsContainer = createParagraph("", "options");
  nextButton = createButton("Next", "next");
  scorecard = createScorecard();

 
  quizBox.append(questionText, quizContainer, optionsContainer, nextButton, scorecard);
  displayQuestion(currentQuestionIndex);

  
  nextButton.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
      if (currentQuestionIndex === 4) {
        nextButton.style.display = "none";
        scorecard.style.display = "block";
      }
      displayQuestion(currentQuestionIndex);
    }
  });


  scorecard.addEventListener("click", displayFinalScore);
}

function fetchNewQuiz() {

  quizBox.innerHTML = `
    <button class="generating">Generating...</button>
    <video id="loadVideo" autoplay muted loop>
      <source src="${chrome.runtime.getURL('assets/loadVideo.mp4')}" type="video/mp4">
    </video>
    <div class="close">×</div>
  `;
  quizBox.classList.add("gap-5");
  quizBox.querySelector(".close").addEventListener("click", () => {
    document.body.removeChild(quizBox);
  });

  const generating = quizBox.querySelector(".generating");
  const loadVideo = quizBox.querySelector("#loadVideo");
  generating.disabled = true;
  generating.style.cursor = "text";

 
  chrome.runtime.sendMessage({ action: "getTabUrl" }, (response) => {
    if (response.error) {
      console.error(response.error);
      generating.innerText = "Try Again";
      generating.classList.add("dark");
      generating.disabled = false;
      generating.style.cursor = "pointer";
      const sourceElement = loadVideo.querySelector('source');
      sourceElement.src = chrome.runtime.getURL('assets/error.mp4');
      loadVideo.load();

      generating.addEventListener("click", () => {
        generating.disabled = true;
        generating.style.cursor = "text";
        generating.classList.remove("dark");
        fetchNewQuiz();
      })
      return;
    }

    console.log("Received new quiz data:", response.quizData);
    quizData = response.quizData;

    if (quizData) {
      currentQuestionIndex = 0;
      score = 0;
      initializeQuiz(quizBox, generating, loadVideo);
    }
  });
}

function displayQuestion(index) {
  if (index >= quizData.length) return;

  const question = quizData[index].question;
  const options = getOptions(quizData[index]);

  questionText.innerText = `Question ${index + 1}`;
  quizContainer.innerHTML = question;
  optionsContainer.innerHTML = "";

  options.forEach((option, i) => {
    const optionElement = createOption(option, i + 1);
    optionElement.addEventListener("click", () => handleOptionClick(optionElement, quizData[index]));
    optionsContainer.appendChild(optionElement);
  });
}

function handleOptionClick(optionElement, currentQuestion) {
  const userAnswer = optionElement.dataset.option;
  const correctAnswer = currentQuestion.correct_answer;

  if (userAnswer === correctAnswer) {
    optionElement.classList.add("correct_ans");
    score++;
  } else {
    optionElement.classList.add("wrong_ans");
    const allOptions = document.querySelectorAll(".option_quiz");
    allOptions.forEach(option => {
      if (option.className.includes(correctAnswer)) {
        option.classList.add("correct_ans");
      }
    });
  }
  const options = document.querySelectorAll(".option_quiz");
  options.forEach(option => {
    option.style.pointerEvents = "none";
  });


}

function displayFinalScore() {
  scorecard.style.display = "none";
  questionText.innerText = "";
  quizContainer.innerHTML = "Your score";
  quizContainer.classList.add("bigText");
  optionsContainer.innerHTML = `${score}/5`;
  optionsContainer.classList.add("biggestText", "score");

  const wish = document.createElement("p");
  wish.className = "wish";
  wish.innerText = wishTextfunc();
  quizBox.appendChild(wish);

 
  const generateAgainButton = createButton("Generate Again", "generating");
  generateAgainButton.classList.add("dark");
  quizBox.appendChild(generateAgainButton);

  
  generateAgainButton.addEventListener("click", () => {
    
    resetQuizUI();
    fetchNewQuiz();
  });
}


function wishTextfunc() {
  switch (score) {
    case 0:
      return "Don't give up, try again!";
    case 1:
      return "Good effort, keep practicing!";
    case 2:
      return "On the right path, keep pushing!";
    case 3:
      return "Good job, you're halfway!";
    case 4:
      return "Fantastic, so close to the top!";
    case 5:
      return "Perfect score, excellent work!";
    default:
      return "Invalid score!";
  }
}




// Helper functions

function resetQuizUI() {
  questionText.innerText = "";
  quizContainer.innerHTML = "";
  optionsContainer.innerHTML = "";
  quizContainer.classList.remove("bigText");
  optionsContainer.classList.remove("biggestText", "score");
}


function createButton(text, className) {
  const button = document.createElement("button");
  button.innerText = text;
  button.className = className;
  return button;
}

function createParagraph(text, className) {
  const paragraph = document.createElement("p");
  paragraph.innerText = text;
  paragraph.className = className;
  return paragraph;
}

function createScorecard() {
  const scorecard = document.createElement("button");
  scorecard.id = "scorecard";
  scorecard.className = "scorecard";
  scorecard.innerText = "Show Scorecard"
  scorecard.style.display = "none";
  return scorecard;
}

function createOption(option, number) {
  const optionElement = document.createElement("p");
  optionElement.className = `option_quiz option_${number}`;
  optionElement.innerText = option;
  optionElement.dataset.option = `option_${number}`;
  return optionElement;
}

function getOptions(question) {
  return [question.option_1, question.option_2, question.option_3, question.option_4];
}

function highlightCorrectAnswer(correctAnswer) {
  const correctOption = document.querySelector(`.option.${correctAnswer}`);
  if (correctOption) correctOption.classList.add("correct_ans");
}