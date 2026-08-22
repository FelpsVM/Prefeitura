var form = document.querySelector("form");
var submitBtn = form.querySelector(".submit");
var errorMsg = document.getElementById("errorMsg");

function showError(message) {
    if (!errorMsg) {
        errorMsg = document.createElement("p");
        errorMsg.id = "errorMsg";
        errorMsg.style.color = "#dc2626";
        errorMsg.style.fontSize = "13.5px";
        errorMsg.style.marginTop = "14px";
        errorMsg.style.textAlign = "center";
        form.insertAdjacentElement("afterend", errorMsg);
    }
    errorMsg.textContent = message;
}

function clearError() {
    if (errorMsg) {
        errorMsg.textContent = "";
    }
}

function login(email, password) {
    submitBtn.disabled = true;

    fetch("/loginUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(function(response) {
        return response.json().then(function(data) {
            return { ok: response.ok, data: data };
        });
    })
    .then(function(result) {
        if (!result.ok || !result.data.success) {
            showError(result.data.message || "Não foi possível entrar.");
            return;
        }

        clearError();
        console.log("Login realizado:", result.data.user);

        window.location.href = "/perfil";
    })
    .catch(function(error) {
        console.error("Erro:", error);
        showError("Erro ao conectar com o servidor. Tente novamente.");
    })
    .finally(function() {
        submitBtn.disabled = false;
    });
}

form.addEventListener("submit", function(event) {
    event.preventDefault();
    clearError();

    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    login(email, password);
});