from flask import Flask, render_template, request, jsonify

from data import dataControl

app = Flask(__name__)

@app.route('/register')
def register():
    return render_template("register.html")

@app.route('/login')
def login():
    return render_template("login.html")

@app.route("/createUser", methods=["POST"])
def createUser():
    dados = request.get_json(silent=True) or {}

    name = dados.get("name")
    email = dados.get("email")
    number = dados.get("number")
    password = dados.get("password")

    success, message, user_id = dataControl.create_user(name, email, number, password)

    if not success:
        return jsonify({"success": False, "message": message}), 400

    return jsonify({"success": True, "message": message, "userId": user_id}), 201

@app.route("/loginUser", methods=["POST"])
def loginUser():
    dados = request.get_json(silent=True) or {}

    email = dados.get("email")
    password = dados.get("password")

    user = dataControl.authenticate_user(email, password)

    if user is None:
        return jsonify({"success": False, "message": "E-mail ou senha inválidos."}), 401

    return jsonify({"success": True, "message": "Login realizado!", "user": user}), 200

if __name__ == '__main__':
    dataControl.init_db()
    app.run(debug=True)