# backend/app.py

from flask import Flask, request, jsonify
# ... (all other imports remain the same) ...
from flask_cors import CORS # <--- ADD THIS LINE
import pickle
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in .env file.")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    print("Gemini API configured successfully.")
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    model = None

app = Flask(__name__)
CORS(app)

# ... (ML model loading and predict_food_spoilage function remain the same) ...
try:
    with open('classifier_model.pkl', 'rb') as f: clf = pickle.load(f)
    with open('regressor_model.pkl', 'rb') as f: reg = pickle.load(f)
    with open('scaler.pkl', 'rb') as f: scaler = pickle.load(f)
    print("ML models loaded successfully.")
except FileNotFoundError:
    print("Model files not found! Please run model.py first to generate them.")
    exit()

def predict_food_spoilage(temp, moisture, gas):
    features_scaled = scaler.transform([[temp, moisture, gas]])
    is_spoiled = clf.predict(features_scaled)[0]
    if is_spoiled: return {"prediction": "Spoiled", "days_remaining": 0}
    else:
        days_remaining = reg.predict(features_scaled)[0]
        status = "Spoiled"
        if days_remaining > 2: status = "Fresh"
        elif 0 < days_remaining <= 2: status = "Use Soon"
        return {"prediction": status, "days_remaining": round(days_remaining, 2)}

@app.route('/api/predict', methods=['POST'])
def predict_api():
    try:
        data = request.get_json()
        temperature = float(data['temperature']); moisture = float(data['moisture']); gas = float(data['gas'])
        food_type = data.get('food_type', 'Unknown Food')
        result = predict_food_spoilage(temperature, moisture, gas)
        result['food_type'] = food_type
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/chat', methods=['POST'])
def chat():
    if not model:
        return jsonify({"reply": "Error: Gemini API is not configured on the server."}), 500

    try:
        data = request.get_json()
        command = data.get('message', '').strip()
        context = data.get('context', '')

        # --- UPGRADED PROMPTS ---
        if command == "GET_LEFTOVER_RECIPES":
            # THIS PROMPT IS NOW STRICTER ABOUT LENGTH AND FORMAT
            prompt = f"You are Anna, a food waste assistant. Suggest one simple recipe for '{context}'. IMPORTANT: The entire response must be under 125 words. Use Markdown for a title (e.g., **Recipe Name**). Provide a bulleted list for ingredients and a numbered list for steps."
        elif command == "GET_FOOD_SAFETY_TIPS":
            prompt = f"You are Anna, a food waste assistant. Provide 3 key food safety tips for storing '{context}'. Use a numbered list. Keep it concise."
        else:
            prompt = (f"You are Anna, a helpful assistant. Keep responses under 50 words. User's question: '{command}'")
        
        # ... (Safety settings and the rest of the function remain the same) ...
        safety_settings = {
            'HARM_CATEGORY_HARASSMENT': 'BLOCK_NONE',
            'HARM_CATEGORY_HATE_SPEECH': 'BLOCK_NONE',
            'HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_NONE',
            'HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_NONE',
        }
        response = model.generate_content(prompt, safety_settings=safety_settings)
        try:
            reply_text = response.text
        except ValueError:
            reply_text = "I apologize, but I couldn't generate a response for that topic. Could you ask something else?"
        return jsonify({'reply': reply_text})

    except Exception as e:
        print(f"Chat endpoint error: {type(e).__name__}: {e}")
        return jsonify({'reply': "I'm experiencing technical difficulties."}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)