import streamlit as st
import pandas as pd
import numpy as np
import joblib

# --- Load saved components ---
MODEL_FILE = 'dal_spoilage_final_model.joblib' # Tuned XGBoost
PREPROCESSOR_FILE = 'dal_spoilage_preprocessor.joblib' # Contains StandardScaler and OneHotEncoder
LE_FILE = 'dal_spoilage_label_encoder.joblib' # Label Encoder

try:
    model = joblib.load(MODEL_FILE)
    preprocessor = joblib.load(PREPROCESSOR_FILE)
    le = joblib.load(LE_FILE)
except FileNotFoundError as e:
    st.error(f"Error: Model file not found ({e}). Please ensure all .joblib files are in the same directory.")
    st.stop()
except Exception as e:
    st.error(f"An error occurred loading model components: {e}")
    st.stop()

# --- Configuration ---
st.set_page_config(page_title="Dal Spoilage Detector (High Accuracy)", layout="centered")

# --- Logical Constraint Handler (Enhanced) ---
def check_logical_spoilage(time_hrs, storage, acidity, consistency, smell, oil_sep):
    """
    Applies real-world constraints to override ML prediction for obvious spoilage.
    Returns: True if logically spoiled, False otherwise.
    """
    reasons = []

    # 1. Time & Room Temperature Constraint (Dal won't survive > 24 hrs at RT)
    if storage == 'Room Temperature' and time_hrs > 24:
        reasons.append("Stored at **room temperature** for over **24 hours**.")

    # 2. Extreme Time Constraint (Over 120 hours is unsafe regardless of storage)
    if time_hrs > 120:
        reasons.append("Time since preparation exceeds the absolute safe limit of **120 hours**.")

    # 3. High Acidity/High Time at RT
    if storage == 'Room Temperature' and time_hrs >= 8 and acidity in ['High', 'Moderate']:
        reasons.append("Stored at **room temperature** for **8+ hours** combined with **sourness/high acidity**.")
    elif storage == 'Refrigerator' and time_hrs >= 72 and acidity == 'High':
        reasons.append("Stored in the **refrigerator** for **72+ hours** with reported **high acidity**.")

    # 4. Extreme Sensory Constraint
    if smell in ['Very Sour', 'Musty', 'Foul']:
        reasons.append(f"Reported **{smell}** smell, which is a strong spoilage indicator.")
    if consistency == 'Slimy':
        reasons.append("Reported **slimy** consistency, a clear sign of microbial growth.")

    if reasons:
        return True, reasons
    return False, []

# --- Prediction Function ---
def predict_spoilage(input_data):
    """Preprocesses input data using the saved preprocessor and uses the ML model for prediction."""
    df_input = pd.DataFrame([input_data])
    
    # Use the loaded preprocessor object to transform the input data in one step
    processed_input = preprocessor.transform(df_input)

    # Predict
    prediction_proba = model.predict_proba(processed_input)[0]
    prediction = model.predict(processed_input)[0]

    # Convert prediction back to string label
    result_label = le.inverse_transform([prediction])[0]
    # Prediction of 'Spoiled' is typically the 1-index
    spoiled_index = 1 if le.classes_[1] == 'Spoiled' else 0
    confidence = prediction_proba[spoiled_index] * 100

    return result_label, confidence

# --- Streamlit UI ---
st.title("🍲 Dal Spoilage Detector (High Accuracy)")
st.markdown("Answer the questions accurately to get a reliable spoilage prediction.")
st.markdown("---")

with st.form("spoilage_form"):
    st.header("⏳ Storage & Time Details")

    time_since_prep = st.slider(
        "Time since preparation (hours)",
        min_value=0,
        max_value=120, 
        value=6,
        step=1,
        help="Enter the approximate time since the Dal was cooked. Max safe limit is 120 hours."
    )

    storage_place = st.selectbox(
        "Storage Place",
        ('Room Temperature', 'Refrigerator', 'Freezer'),
        help="Where has the Dal been stored?"
    )

    st.header("👃 Sensory Observations")

    smell = st.selectbox(
        "Smell",
        ('Normal', 'Slightly Sour', 'Very Sour', 'Musty', 'Foul'),
        help="Describe the current smell of the Dal."
    )

    consistency = st.selectbox(
        "Consistency",
        ('Normal', 'Slightly Thickened', 'Watery', 'Slimy'),
        help="Describe the Dal's consistency/texture."
    )

    acidity_source = st.selectbox(
        "Acidity/Taste Source",
        ('Low/Normal', 'Moderate', 'High'),
        help="Is the Dal sour/acidic?"
    )

    st.header("🔬 Physical Observations")

    container_type = st.selectbox(
        "Container Type",
        ('Steel/Metal', 'Plastic', 'Ceramic/Glass', 'Other'),
        help="What type of container was used for storage?"
    )

    oil_separation = st.slider(
        "Oil/Water Separation (Scale 0.0 to 1.0)",
        min_value=0.0,
        max_value=1.0,
        value=0.0,
        step=0.1,
        help="Estimate the degree of separation (0.0 = None, 1.0 = Significant)."
    )

    submitted = st.form_submit_button("Get Prediction")

if submitted:
    input_data = {
        'Time_since_preparation_hours': time_since_prep,
        'Storage_place': storage_place,
        'Acidity_source': acidity_source,
        'Consistency': consistency,
        'Container_type': container_type,
        'Smell': smell,
        'Oil_separation': oil_separation
    }

    # 1. Apply Logical Constraints First
    is_logically_spoiled, reasons = check_logical_spoilage(
        time_since_prep, storage_place, acidity_source, consistency, smell, oil_separation
    )

    st.subheader("✅ Spoilage Assessment")

    if is_logically_spoiled:
        # Logical Override
        st.markdown(f"## ❌ Yes, the Dal is spoiled")
        st.markdown(f"**Reason (Food Safety Rule):**")
        for reason in reasons:
            st.warning(f"* {reason}")
        st.info("The prediction is based on established food safety rules, overriding the Machine Learning model for safety.")
    else:
        # ML Model Prediction
        try:
            result_label, confidence = predict_spoilage(input_data)

            if result_label == 'Spoiled':
                st.markdown(f"## ❌ Yes, the Dal is spoiled")
                st.info(f"The model is {confidence:.2f}% confident in this prediction.")
            else:
                st.markdown(f"## ✅ No, the Dal is not spoiled")
                st.info(f"The model is {confidence:.2f}% confident in this prediction.")

            st.success("The prediction is based on the trained High-Accuracy XGBoost Model.")
        except Exception as e:
            st.error(f"A runtime error occurred during ML prediction: {e}")
            st.error("Check input data types and model compatibility.")