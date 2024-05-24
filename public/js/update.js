const forms = document.querySelectorAll(".updateForm"); // Select all forms with the class .updateForm

forms.forEach(form => {
    form.addEventListener("input", function () {
        const updateBtn = form.querySelector("button"); // Select the button within the current form
        updateBtn.removeAttribute("disabled");
    });
});
