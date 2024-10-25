from crypt import methods
from datetime import timedelta
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
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(weeks=5215)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(weeks=5215)
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
                "owner": {"name": data["userName"], "email": data["email"]},
                "members": [{"name": data["userName"], "email": data["email"]}],
                "code": roomCode,
                "gameStarted": False
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

        if data["email"] in room.get("bannedUsers", []):
            return jsonify({"error": "User is banned from this room"}), 403

        if not any(member["email"] == data["email"] for member in room["members"]):
            room["members"].append(
                {"id": data["userID"], "name": data["name"], "email": data["email"], "points": 0, "trueAnswers": 0,
                 "falseAnswers": 0})
            roomsCollection.update_one({"code": data["roomCode"]}, {"$set": {"members": room["members"]}})

        # Extract only the names of the members
        member_names = [member["name"] for member in room["members"]]

        return jsonify(
            {"message": "Room joined successfully",
             "room": {
                 "name": room["name"],
                 "members": member_names,
                 "questions": room["questions"],
                 "code": room["code"]
             }
             }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/joinGuest", methods=["POST"])
def joinGuest():
    try:
        app.logger.info("Joining as guest")
        client = MongoClient(uri, server_api=ServerApi("1"))
        database = client["app"]
        roomsCollection = database["rooms"]
        guestsCollection = database["guests"]

        data = request.json

        result = guestsCollection.insert_one(
            {
                "name": data["name"],
                "email": "guest@app.com",
                "time": current(),
            })
        room = roomsCollection.find_one({"code": data["roomCode"]})
        if not room:
            return jsonify({"error": "Room not found"}), 404

        # Convert ObjectId to string before appending to room["members"]
        room["members"].append(
            {"id": str(result.inserted_id), "name": data["name"], "email": "guest@app.com", "points": 0,
             "trueAnswers": 0, "falseAnswers": 0}
        )
        roomsCollection.update_one({"code": data["roomCode"]}, {"$set": {"members": room["members"]}})

        # Return only the names of the members
        member_names = [member["name"] for member in room["members"]]

        return jsonify(
            {"message": "Room found",
             "room": {
                 "name": room["name"],
                 "members": member_names,
                 "questions": room["questions"],
                 "code": room["code"],
                 "guest": {"id": str(result.inserted_id), "name": data["name"]}
             }
             }), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


@app.route("/addQuestion", methods=["POST"])
@jwt_required()
def addQuestion():
    try:
        app.logger.info("Adding question")
        client = MongoClient(uri, server_api=ServerApi("1"))
        questionID = generateCode(length=64)
        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json
        print(data)
        room = roomsCollection.find_one({"code": data["roomCode"]})

        if not room:
            return jsonify({"error": "Room not found"}), 404

        room["questions"].append({"id": questionID, "question": data["question"],
                                  "answers": {"a": data["answers"]["a"], "b": data["answers"]["b"],
                                              "c": data["answers"]["c"], "d": data["answers"]["d"]
                                              }, "correct": data["correct"], "point": data["point"],
                                  "time": data["time"]})
        roomsCollection.update_one({"code": data["roomCode"]}, {"$set": {"questions": room["questions"]}})
        return jsonify(
            {"message": "Question added successfully",
             "room": {"name": room["name"], "members": room["members"], "questions": room["questions"],
                      "code": room["code"]}}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/room", methods=["POST"])
def getRoom():
    try:
        app.logger.info("Getting room info")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json

        room = roomsCollection.find_one({"code": data["roomCode"]})

        if not room:
            return jsonify({"error": "Room not found"}), 404

        if data["email"] in room.get("bannedUsers", []) or not any(
                member["email"] == data["email"] for member in room["members"]):
            return jsonify({"error": "Access denied"}), 403

        # Extract only the names of the members
        member_names = [member["name"] for member in room["members"]]

        return jsonify(
            {"message": "Room found",
             "room": {
                 "name": room["name"],
                 "owner": room["owner"],
                 "members": member_names,
                 "questions": room["questions"],
                 "code": room["code"],
                 "gameStarted": room["gameStarted"]
             }
             }), 200
    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 500


@app.route("/getQuestions", methods=["POST"])
def getQuestions():
    try:
        app.logger.info("Getting questions")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json

        room = roomsCollection.find_one({"code": data["roomCode"]})

        if not room:
            return jsonify({"error": "Room not found"}), 404

        return jsonify(
            {"message": "Questions found",
             "questions": room["questions"]}), 200
    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 500


@app.route("/deleteQuestion", methods=["POST"])
@jwt_required()
def deleteQuestion():
    try:
        app.logger.info("Deleting question")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json

        room = roomsCollection.find_one({"code": data["roomCode"]})

        if not room:
            return jsonify({"error": "Room not found"}), 404

        room["questions"] = [q for q in room["questions"] if q.get("id") != data["questionID"]]
        roomsCollection.update_one({"code": data["roomCode"]}, {"$set": {"questions": room["questions"]}})
        return jsonify(
            {"message": "Question deleted successfully",
             "room": {"name": room["name"], "members": room["members"], "questions": room["questions"],
                      "code": room["code"]}}), 200
    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 500


@app.route("/getQuestion", methods=["POST"])
def getQuestion():
    try:
        app.logger.info("Getting question")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json

        room = roomsCollection.find_one({"code": data["roomCode"]})

        if not room:
            return jsonify({"error": "Room not found"}), 404

        question = room["questions"][int(data["questionNumber"]) - 1]  # Adjust for 1-based index
        return jsonify(
            {"message": "Question found",
             "question": question}), 200
    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 500


@app.route("/deleteRoom", methods=["POST"])
@jwt_required()
def deleteRoom():
    try:
        app.logger.info("Deleting room")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json

        room = roomsCollection.find_one({"code": data["roomCode"]})

        if not room:
            return jsonify({"error": "Room not found"}), 404

        roomsCollection.delete_one({"code": data["roomCode"]})
        return jsonify(
            {"message": "Room deleted successfully"}), 200
    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 500


@app.route("/banUser", methods=["POST"])
@jwt_required()
def banUser():
    try:
        app.logger.info("Banning user")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json

        room = roomsCollection.find_one({"code": data["roomCode"]})

        if not room:
            return jsonify({"error": "Room not found"}), 404

        room["members"] = [m for m in room["members"] if m.get("email") != data["email"]]
        if "bannedUsers" not in room:
            room["bannedUsers"] = []
        room["bannedUsers"].append(data["email"])
        roomsCollection.update_one({"code": data["roomCode"]},
                                   {"$set": {"members": room["members"], "bannedUsers": room["bannedUsers"]}})
        return jsonify(
            {"message": "User banned successfully",
             "room": {"name": room["name"], "members": room["members"], "questions": room["questions"],
                      "code": room["code"]}}), 200
    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 500


@app.route("/loadUsers", methods=["POST"])
def loadUsers():
    try:
        app.logger.info("Loading users")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json
        room = roomsCollection.find_one({"code": data["roomCode"]})

        if not room:
            return jsonify({"error": "Room not found"}), 404

        # Extract only the names of the users
        user_names = [user["name"] for user in room["members"]]

        return jsonify(
            {"message": "Users found",
             "users": user_names}), 200
    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 500


@app.route("/exitRoom", methods=["POST"])
def exitRoom():
    try:
        app.logger.info("Exiting room")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json
        room = roomsCollection.find_one({"code": data["roomCode"]})

        if not room:
            return jsonify({"error": "Room not found"}), 404

        room["members"] = [m for m in room["members"] if m.get("email") != data["email"]]
        roomsCollection.update_one({"code": data["roomCode"]},
                                   {"$set": {"members": room["members"]}})
        return jsonify(
            {"message": "User exited successfully",
             "room": {"name": room["name"], "members": room["members"], "questions": room["questions"],
                      "code": room["code"]}}), 200
    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 500


@app.route("/startGame", methods=["POST"])
@jwt_required()
def startGame():
    try:
        app.logger.info("Starting game")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json
        room = roomsCollection.find_one({"code": data["roomCode"]})

        if not room:
            return jsonify({"error": "Room not found"}), 404

        room["gameStarted"] = True
        roomsCollection.update_one({"code": data["roomCode"]},
                                   {"$set": {"gameStarted": True}})
        return jsonify(
            {"message": "Game started successfully",
             "room": {"name": room["name"], "members": room["members"], "questions": room["questions"],
                      "code": room["code"]}}), 200
    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 500


@app.route("/endGame", methods=["POST"])
@jwt_required()
def endGame():
    try:
        app.logger.info("Ending game")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json
        room = roomsCollection.find_one({"code": data["roomCode"]})
        if not room:
            return jsonify({"error": "Room not found"}), 404

        room["gameStarted"] = False
        roomsCollection.update_one({"code": data["roomCode"]},
                                   {"$set": {"gameStarted": False}})
        return jsonify(
            {"message": "Game ended successfully",
             "room": {"name": room["name"], "members": room["members"], "questions": room["questions"],
                      "code": room["code"]}}), 200
    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 500


@app.route("/getGameStatus", methods=["POST"])
def getGameStatus():
    try:
        app.logger.info("Getting game status")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json
        room = roomsCollection.find_one({"code": data["roomCode"]})

        if not room:
            return jsonify({"error": "Room not found"}), 404

        return jsonify(
            {"message": "Game status found",
             "gameStarted": room["gameStarted"]}), 200
    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 500


@app.route("/submitAnswer", methods=["POST"])
def submitAnswer():
    try:
        app.logger.info("Submitting answer")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json
        room = roomsCollection.find_one({"code": data["roomCode"]})
        if not room:
            return jsonify({"error": "Room not found"}), 404

        user = next((member for member in room["members"] if member.get("id") == data["userID"]), None)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if data["answer"] == data["correct"]:

            basePoint = data["point"]
            finalPoint = int((basePoint * (basePoint / (data["timeTaken"] / 96))) / 128)

            user["points"] += finalPoint
            user["trueAnswers"] = user.get("trueAnswers", 0) + 1
        else:
            user["falseAnswers"] = user.get("falseAnswers", 0) + 1

        roomsCollection.update_one({"code": data["roomCode"]}, {"$set": {"members": room["members"]}})

        questionNumber = int(data["questionNumber"])
        if questionNumber < len(room["questions"]):
            return jsonify({"message": "Correct answer" if data["answer"] == data["correct"] else "Incorrect answer",
                            "status": "next"}), 200
        else:
            return jsonify({"message": "Correct answer" if data["answer"] == data["correct"] else "Incorrect answer",
                            "status": "end"}), 200

    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 500


@app.route("/leaderboard", methods=["POST"])
def leaderboard():
    try:
        app.logger.info("Getting leaderboard")
        client = MongoClient(uri, server_api=ServerApi("1"))

        database = client["app"]
        roomsCollection = database["rooms"]

        data = request.json
        room = roomsCollection.find_one({"code": data["roomCode"]})

        if not room:
            return jsonify({"error": "Room not found"}), 404

        leaderboard = sorted([member for member in room["members"] if member["name"] != room["owner"]["name"]],
                             key=lambda x: x.get("points", 0), reverse=True)
        return jsonify(
            {"message": "Leaderboard found",
             "roomName": room["name"],
             "leaderboard": leaderboard,
             "owner": room["owner"]["email"]}), 200
    except Exception as e:
        app.logger.error(e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host=Config.HOST, port=8080)
