from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from config import Config
from utils.timestamp import current
from utils.hashing import hashPassword, verifyPassword
from flask_jwt_extended import JWTManager, create_access_token

uri = f"mongodb+srv://{Config.Mongo.USERNAME}:{Config.Mongo.PASSWORD}@app.fqx7f.mongodb.net/?retryWrites=true&w=majority&appName=app"

app = Flask(__name__)
cors = CORS(app, origins="*")
app.config["SECRET_KEY"] = Config.SECRET_KEY
app.config['JWT_SECRET_KEY'] = Config.SECRET_KEY
jwt = JWTManager(app)


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


if __name__ == "__main__":
    app.run(debug=True, port=8080)
