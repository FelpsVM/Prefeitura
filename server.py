import os

from flask import Flask, render_template, request, jsonify, session, redirect, url_for

from data import dataControl

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-troque-em-producao")

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

    session["email"] = user["email"]

    return jsonify({"success": True, "message": "Login realizado!", "user": user}), 200

@app.route('/perfil')
def perfil():
    if "email" not in session:
        return redirect(url_for("login"))

    return render_template("perfil.html")

@app.route("/getUserInfo", methods=["GET"])
def getUserInfo():
    if "email" not in session:
        return jsonify({"success": False, "message": "Não autenticado."}), 401

    user = dataControl.get_user_by_email(session["email"])

    if user is None:
        session.pop("email", None)
        return jsonify({"success": False, "message": "Usuário não encontrado."}), 404

    return jsonify({"success": True, "user": user}), 200

@app.route("/updateNotifications", methods=["POST"])
def updateNotifications():
    if "email" not in session:
        return jsonify({"success": False, "message": "Não autenticado."}), 401

    dados = request.get_json(silent=True) or {}

    notify_email = bool(dados.get("email"))
    notify_sms = bool(dados.get("sms"))
    notify_whatsapp = bool(dados.get("whatsapp"))

    success, message = dataControl.update_notification_prefs(
        session["email"], notify_email, notify_sms, notify_whatsapp
    )

    if not success:
        return jsonify({"success": False, "message": message}), 400

    return jsonify({"success": True, "message": message}), 200

if __name__ == '__main__':
    dataControl.init_db()
    app.run(debug=True)