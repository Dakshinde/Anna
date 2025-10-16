# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
import google.generativeai as genai
from dotenv import load_dotenv
import googlemaps
import smtplib
from email.mime.text import MIMEText

load_dotenv()

# --- Initialize APIs (Unchanged) ---
try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key: raise ValueError("GEMINI_API_KEY not found in .env file.")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    print("✅ Gemini API configured successfully.")
except Exception as e:
    print(f"❌ Error configuring Gemini API: {e}")
    model = None

try:
    gmaps_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not gmaps_api_key: raise ValueError("GOOGLE_MAPS_API_KEY not found in .env file.")
    gmaps = googlemaps.Client(key=gmaps_api_key)
    print("✅ Google Maps client initialized successfully.")
except Exception as e:
    print(f"❌ Error initializing Google Maps client: {e}")
    gmaps = None

app = Flask(__name__)
CORS(app)

# --- SECTION EDITED: Load BOTH ML Models ---
try:
    # Use the 'models' subfolder as per our professional structure
    classifier_model = joblib.load(os.path.join('models', 'food_spoilage_model.joblib'))
    print("✅ Classifier model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading classifier model: {e}")
    classifier_model = None

try:
    regressor_model = joblib.load(os.path.join('models', 'food_shelf_life_regressor.joblib'))
    print("✅ Regressor model for shelf life loaded successfully.")
except Exception as e:
    print(f"❌ Error loading regressor model: {e}")
    regressor_model = None


# --- SECTION EDITED: Prediction Endpoint using BOTH models ---
@app.route('/api/predict', methods=['POST'])
def predict_api():
    if not classifier_model or not regressor_model:
        return jsonify({'error': 'One or more ML models failed to load. Check server logs.'}), 500

    try:
        data = request.get_json()
        print(f"Received prediction request: {data}")
        
        required_fields = ['food_type', 'temperature', 'moisture', 'gas']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Invalid request body. Missing required fields.'}), 400
        
        input_df = pd.DataFrame([data])
        input_df = input_df[required_fields]

        # Step 1: Classify if the food is spoiled
        is_spoiled = int(classifier_model.predict(input_df)[0])
        
        days_remaining = 0
        status = "Spoiled"

        # Step 2: If NOT spoiled, predict the remaining shelf life
        if is_spoiled == 0:
            status = "Not Spoiled"
            # Use the regressor to get the number of days
            days_pred = regressor_model.predict(input_df)
            days_remaining = max(0, round(float(days_pred[0]), 1))

        # Step 3: Construct the complete response
        response = {
            'prediction': is_spoiled,
            'status': status,
            'days_remaining': days_remaining,
            'food_type': data['food_type']
        }
        
        print(f"Sending prediction response: {response}")
        return jsonify(response)

    except Exception as e:
        print(f"❌ An error occurred in the prediction endpoint: {e}")
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500


# --- UNCHANGED SECTIONS ---
@app.route('/api/chat', methods=['POST'])
def chat():
    # ... (this function is unchanged) ...
    if not model: return jsonify({"reply": "Error: Gemini API is not configured on the server."}), 500
    try:
        data = request.get_json()
        command, context = data.get('message', ''), data.get('context', '')
        if command == "GET_LEFTOVER_RECIPES": prompt = f"You are Anna, a food waste assistant. Suggest one simple recipe for '{context}'. IMPORTANT: The entire response must be under 125 words. Use Markdown for a title (e.g., **Recipe Name**). Provide a bulleted list for ingredients and a numbered list for steps."
        elif command == "GET_FOOD_SAFETY_TIPS": prompt = f"You are Anna, a food waste assistant. Provide 3 key food safety tips for storing '{context}'. Use a numbered list. Keep it concise."
        else: prompt = f"You are Anna, a helpful assistant. Keep responses under 50 words. User's question: '{command}'"
        safety_settings = {'HARM_CATEGORY_HARASSMENT': 'BLOCK_NONE','HARM_CATEGORY_HATE_SPEECH': 'BLOCK_NONE','HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_NONE','HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_NONE',}
        response = model.generate_content(prompt, safety_settings=safety_settings)
        return jsonify({'reply': response.text})
    except Exception as e:
        return jsonify({'reply': "I'm experiencing technical difficulties."}), 500

@app.route('/api/get-ngos', methods=['GET'])
def get_ngos():
    # ... (this function is unchanged) ...
    if not gmaps: return jsonify({"error": "Google Maps service is not configured"}), 500
    try:
        lat, lng = float(request.args.get('lat')), float(request.args.get('lng'))
        places_result = gmaps.places_nearby(location=(lat, lng), radius=5000, keyword='NGO OR trust OR food donation')
        ngos_list = [{"id": p['place_id'], "name": p['name'], "address": p.get('vicinity', ''), "location": [p['geometry']['location']['lat'], p['geometry']['location']['lng']]} for p in places_result.get('results', [])]
        return jsonify(ngos_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/notify-ngo', methods=['POST'])
def notify_ngo():
    # ... (this function is unchanged) ...
    try:
        data = request.get_json()
        ngo_name, recipient_email = data['ngo']['name'], os.getenv("EMAIL_SENDER")
        donor_contact, food_details, pickup_address = data['formDetails']['contact'], data['formDetails']['foodDetails'], data['formDetails']['address']
        sender_email, sender_password = os.getenv("EMAIL_SENDER"), os.getenv("EMAIL_APP_PASSWORD")
        if not sender_email or not sender_password: return jsonify({"error": "Email service not configured."}), 500
        subject = f"New Food Donation Alert from Anna Sampada for {ngo_name}!"
        body = f"Hello {ngo_name},\n\nYou have a new food donation offer:\n- Food Details: {food_details}\n- Pickup Address: {pickup_address}\n- Donor Contact: {donor_contact}\n\nPlease coordinate pickup directly.\n\nThank you,\nThe Anna Sampada Team"
        msg = MIMEText(body)
        msg['Subject'], msg['From'], msg['To'] = subject, sender_email, recipient_email
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as s:
            s.login(sender_email, sender_password)
            s.sendmail(sender_email, recipient_email, msg.as_string())
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)

