var form = document.querySelector("form");

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