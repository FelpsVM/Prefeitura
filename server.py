from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/register')
def register():
    return render_template("register.html")

@app.route('/login')
def login():
    return render_template("login.html")

@app.route("/createUser", methods=["POST"])
def createUser():
    dados = request.get_json()

    name = dados["name"]
    email = dados["email"]
    number = dados["number"]
    password = dados["password"]

    print(name)
    print(email)
    print(number)
    print(password)

    return jsonify({
    "success": True,
    "message": "Usuário criado!"
})

if __name__ == '__main__':
    app.run(debug=True)