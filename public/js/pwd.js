const pwBtn = document.querySelector("#pwBtn");
pwBtn.addEventListener("click", function() {
    const pwInput = document.getElementById("pw_input");
    const type = pwInput.getAttribute("type");
    if (type =="password"){
        pwInput.setAttribute("type", "text");
        pwBtn.setAttribute("src", "/images/site/hide_pass.svg")
        //pwBtn.innterHTML="Hide";
    }
    else{
        pwInput.setAttribute("type", "password");
        pwBtn.setAttribute("src", "/images/site/show_pass.svg")
    }
});