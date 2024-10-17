const btn = document.getElementById("btn_quiz");
const next = document.getElementById("next");
const loadVideo = document.getElementById("loadVideo");
const scorecard = document.getElementById("scorecard");
const quizContainer = document.getElementById("quiz");
const optionsContainer = document.getElementById("options");
const question_text = document.querySelector(".question_text");
let score = 0;
next.style.display = "none";
scorecard.style.display = "none";
loadVideo.style.display = "none";
let currentQuestionIndex = 0;
let result;

btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.innerText = "Generating...";
    loadVideo.style.display = "block";
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        var url = tabs[0].url;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://127.0.0.1:5000/getquiz?url=" + url, true);
        xhr.onload = function () {
            result = JSON.parse(xhr.response);
            displayQuestion(currentQuestionIndex);
            btn.style.display = "none";
            loadVideo.style.display = "none";
            next.style.display = "block";
        };
        xhr.send();
    });
});


function displayQuestion(index) {
    question_text.innerText = `Question ${index + 1}`;
    quizContainer.innerHTML = ""; 
    optionsContainer.innerHTML = ""; 

    var question = result[index].question;
    const questionPara = document.createElement("p");
    questionPara.className = "question";
    questionPara.innerText = question;
    quizContainer.appendChild(questionPara);

    for (let i = 1; i <= 4; i++) {
        const optionPara = document.createElement("p");
        optionPara.className = `option option_${i}`;
        optionPara.innerText = `${result[index]['option_' + i]}`;
        
        optionPara.addEventListener("click", () => {
            const user_answer = `option_${i}`; 
            const correct_answer = result[index].correct_answer; 
            
            
            if (user_answer === correct_answer) {
                optionPara.classList.add("correct_ans");
                score++;
            } else {
                optionPara.classList.add("wrong_ans");
                const allOptions = document.querySelectorAll(".option");
                allOptions.forEach(option => {
                    if (option.className.includes(correct_answer)) {
                        option.classList.add("correct_ans"); 
                    }
                });
            }

            const options = document.querySelectorAll(".option");
            options.forEach(option => {
                option.style.pointerEvents = "none"; 
            });
        });

        optionsContainer.appendChild(optionPara);
    }
}

next.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex <= result.length) {
        if(currentQuestionIndex == 4){
            next.style.display = "none";
            scorecard.style.display = "block";
        }
        displayQuestion(currentQuestionIndex);
    } 
});

scorecard.addEventListener("click",()=>{
    scorecard.style.display = "none";
    question_text.innerText = "";
    quizContainer.innerHTML = "Your score"; 
    quizContainer.classList.add("bigText");
    optionsContainer.innerHTML = `${score}/5`;
    optionsContainer.classList.add("biggestText","score");
    const wish = document.createElement("p");
    wish.innerText = wishTextfunc();
    document.body.appendChild(wish);
    wish.className = "wish";
})

function wishTextfunc() {
    switch(score) {
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
