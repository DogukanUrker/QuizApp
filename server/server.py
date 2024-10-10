from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from config import Config
from utils.timestamp import current
from utils.hashing import hashPassword

uri = f"mongodb+srv://{Config.Mongo.USERNAME}:{Config.Mongo.PASSWORD}@app.fqx7f.mongodb.net/?retryWrites=true&w=majority&appName=app"


app = Flask(__name__)
cors = CORS(app, origins="*")


@app.route("/api", methods=["GET"])
def api():
    return jsonify({"message": "Quiz App"})


# Route to add a user
@app.route("/addUser", methods=["POST"])
def add_user():
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


if __name__ == "__main__":
    app.run(debug=True, port=8080)
