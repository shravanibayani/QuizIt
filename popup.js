const btn = document.getElementById("btn_quiz");
btn.addEventListener("click",()=>{
    btn.disabled = true;
    btn.innerText = "Generating...";
    chrome.tabs.query({active: true, currentWindow: true }, (tabs) => {
        var url = tabs[0].url;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://127.0.0.1:5000/getquiz?url="+url, true);
        xhr.onload = function () {
            var result = xhr.response;
            const p = document.getElementById("result");
            p.innerHTML = result;
        }
        xhr.send();
    })
})