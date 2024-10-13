from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from config import Config
from utils.timestamp import current
from utils.hashing import hashPassword, verifyPassword
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt
from utils.codeGenerator import generateCode

uri = f"mongodb+srv://{Config.Mongo.USERNAME}:{Config.Mongo.PASSWORD}@app.fqx7f.mongodb.net/?retryWrites=true&w=majority&appName=app"

app = Flask(__name__)
cors = CORS(app, origins="*")
app.config["SECRET_KEY"] = Config.SECRET_KEY
app.config['JWT_SECRET_KEY'] = Config.SECRET_KEY
jwt = JWTManager(app)

blacklist = set()


@app.route("/api", methods=["GET"])
def api():
    return jsonify({"message": "Quiz App"})


# Route to add a user
@app.route("/addUser", methods=["POST"])
def addUser():
    try:
        app.logger.info("Adding user")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        usersCollection = database["users"]

        data = request.json

        if usersCollection.find_one({"email": data["email"]}):
            return jsonify({"error": "User already exists"}), 500

        usersCollection.insert_one(
            {
                "name": data["name"],
                "password": hashPassword(data["password"]),
                "email": data["email"],
                "time": current(),
            }
        )

        return jsonify({"message": "User added successfully", "user": data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/login", methods=["POST"])
def login():
    try:
        app.logger.info("Logging in")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        usersCollection = database["users"]

        data = request.json

        user = usersCollection.find_one({"email": data["email"]})

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not verifyPassword(data["password"], user["password"]):
            return jsonify({"error": "Invalid password"}), 401

        accessToken = create_access_token(identity=data["email"])
        return jsonify({"message": "Login successful",
                        "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]},
                        "accessToken": accessToken}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    blacklist.add(jti)
    return jsonify({"message": "Successfully logged out"}), 200


@jwt.token_in_blocklist_loader
def check_if_token_is_blacklisted(jwt_header, jwt_payload):
    return jwt_payload["jti"] in blacklist


@app.route("/createRoom", methods=["POST"])
@jwt_required()
def createRoom():
    try:
        app.logger.info("Creating room")
        client = MongoClient(uri, server_api=ServerApi("1"))
        roomCode = generateCode()
        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json

        roomsCollection.insert_one(
            {
                "name": data["name"],
                "questions": [],
                "time": current(),
                "members": [{"name": data["userName"], "email": data["email"]}],
                "code": roomCode,
            }
        )
        return jsonify({"message": "Room created successfully", "room": {"data": data, "code": roomCode}}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/joinRoom", methods=["POST"])
@jwt_required()
def joinRoom():
    try:
        app.logger.info("Joining room")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json

        room = roomsCollection.find_one({"code": data["roomCode"]})

        if not room:
            return jsonify({"error": "Room not found"}), 404

        room["members"].append({"name": data["name"], "email": data["email"]})

        return jsonify(
            {"message": "Room joined successfully",
             "room": {"name": room["name"], "members": room["members"], "questions": room["questions"],
                      "code": room["code"]}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/addQuestion", methods=["POST"])
@jwt_required()
def addQuestion():
    try:
        app.logger.info("Adding question")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json

        room = roomsCollection.find_one({"code": data["roomCode"]})

        if not room:
            return jsonify({"error": "Room not found"}), 404

        room["questions"].append({"question": data["question"],
                                  "answers": {"a": data["a"], "b": data["b"], "c": data["c"], "d": data["d"],
                                              "correct": data["correct"]}})

        return jsonify(
            {"message": "Question added successfully",
             "room": {"name": room["name"], "members": room["members"], "questions": room["questions"],
                      "code": room["code"]}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="192.168.6.31", port=8080)
