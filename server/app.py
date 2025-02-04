import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from langServices import handle_uploaded_pdf, answerQuery, namespace_exists
from flask_cors import CORS, cross_origin
from Database.connection import connectDB
from datetime import datetime
import json
app = Flask(__name__)
CORS(app)  # Enable CORS globally

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSION = 'pdf'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/getHistory",methods=["GET"])
def getHistory():
    try:
        db = connectDB()
        users_collection = db.get_collection("users")
        user_id = request.args.get("user_id")
        user_type = request.args.get("user_type")
        user = users_collection.find_one({"email": user_id, "userType": user_type})
        if user is None:
            return jsonify({"error": "Invalid credentials or userType"}), 400
        
        print("chat history retrieved")
        return jsonify({"history": user['chat_history']}),200
    except Exception as e:



        print("error occured while fetching history")
        return jsonify({"message":str(e)}),400
        


@app.route('/login', methods=['POST'])
def loginUser():
    """API to log in a user."""
    db = connectDB()
    users_collection = db.get_collection("users")
    
    try:
        data = request.json
        print(data)
        
        # Validate required fields
     

        # Find user by email and userType
        user = users_collection.find_one({"email": data["email"], "userType": data["role"]})
        
        if user is None:
            return jsonify({"error": "Invalid credentials "}), 400
        
        # Check if password matches
        if user['password'] != data['password']:
            return jsonify({"error": "Incorrect password"}), 400
        
        # Return success message with user details (except password)
       
        res = {
          "email" : data['email'],
          "role" : data['role']
        } 
        print(res,"res")
        
        return jsonify({"message":"Login Successfull","result":res}), 200
    
    except Exception as e:
        print(e,'error')
        return jsonify({"error": str(e)}), 500

@app.route('/register', methods=['POST'])  # Fix: methods=['POST']
@cross_origin()
def registerUser():
    """API to register a new user."""
    db = connectDB()
    users_collection = db.get_collection("users")
    
    try:
        data = request.json
        print(data,"data")

        # Validate required fields
      

        # Check if user already exists
        if users_collection.find_one({"email": data["email"]}):
            return jsonify({"error": "User already exists"}), 400

        # Prepare user data
        user_data = {
            "username": data["username"],
            "email": data["email"],
            "password": data["password"],  # Plain text (hashing recommended)
            "chat_history": [],
            "userType":data["role"],
            "created_at": datetime.utcnow()
        }

        # Insert into MongoDB
        users_collection.insert_one(user_data)

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def is_pdf(filename):
    """Check if file is a PDF."""
    return filename.lower().endswith('.pdf')


@app.route('/upload', methods=['POST'])
@cross_origin()
def upload_pdf():
    """Upload and process a PDF file."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    try:
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if file and is_pdf(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Extract user details from request (assuming sent as form-data)
            user_type = request.form.get("user_type", "default")
            user_id = request.form.get("user_id", "unknown")
            
            # Process the uploaded file
            handle_uploaded_pdf(file_path, user_type, user_id)
            
            return jsonify({"message": "File uploaded and processed successfully", "file_path": file_path}), 200
        else:
            return jsonify({"error": "Only PDF files are allowed"}), 400
    except Exception as e:
        return jsonify({"error": e}),400


@app.route('/getresponse', methods=['GET'])
@cross_origin()
def getResponse():
    """Fetch response for a user query."""
    user_id = request.args.get("user_id")
    user_type = request.args.get("user_type")
    user_question = request.args.get("user_question")
    print(user_id, user_type,user_question)
    if not all([user_id, user_type, user_question]):
        return jsonify({"error": "Missing parameters"}), 400

    result = answerQuery(user_question, user_type, user_id)
    return jsonify({"message": "Query Successful", "answer": result}), 200


@app.route("/check-namespace",methods=["GET"])
def check_nameSpace():
    print("called")
    user_id = request.args.get("email")
    user_type = request.args.get("role")
    namespace = f"{user_type}_{user_id}"
    print(namespace,"namespace")
    try:
        if(namespace_exists(namespace)):
            return jsonify({'result':1}),200
        else:
            return jsonify({'result':0}),200
    except Exception as e:
        print(e,'error')
        return jsonify({"message":"Internal Server Error"}),501
    
if __name__ == '__main__':
    app.run(debug=True)