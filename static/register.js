var form = document.querySelector("form");
var phoneInput = document.getElementById("phone");

function maskPhone(value) {
    var digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length === 0) {
        return "";
    }
    if (digits.length <= 2) {
        return "(" + digits;
    }
    if (digits.length <= 6) {
        return "(" + digits.slice(0, 2) + ") " + digits.slice(2);
    }
    if (digits.length <= 10) {
        // telefone fixo: (00) 0000-0000
        return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 6) + "-" + digits.slice(6);
    }
    // celular: (00) 00000-0000
    return "(" + digits.slice(0, 2) + ") " + digits.slice(2, 7) + "-" + digits.slice(7);
}

phoneInput.addEventListener("input", function(event) {
    event.target.value = maskPhone(event.target.value);
});

phoneInput.addEventListener("keypress", function(event) {
    if (event.key.length === 1 && !/[0-9]/.test(event.key)) {
        event.preventDefault();
    }
});

function register(name, email, number, pass) {
    fetch("/createUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            number: number,
            password: pass
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error("Erro:", error);
    });
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var number = document.getElementById("phone").value;
    var password = document.getElementById("password").value;

    register(name, email, number, password);
});