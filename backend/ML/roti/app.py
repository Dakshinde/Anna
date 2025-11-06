import pandas as pd
import streamlit as st
import joblib
import os
import time

# --- Configuration ---
MODEL_FILE = 'roti_spoiler_pipeline.joblib'

# --- Utility Functions ---

@st.cache_resource
def load_model():
    """Loads the saved ML pipeline using caching."""
    if not os.path.exists(MODEL_FILE):
        st.error(f"Model file '{MODEL_FILE}' not found.")
        st.info("Please run the 'roti_spoilage_trainer.py' script first to generate the model.")
        return None
    try:
        pipeline = joblib.load(MODEL_FILE)
        return pipeline
    except Exception as e:
        st.error(f"Error loading model: {e}")
        return None

# --- Main Streamlit App ---

def main():
    st.set_page_config(
        page_title="Roti Spoilage Detector",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    st.title("🍞 Roti Spoilage Detector (ML Powered)")
    st.markdown(
        """
        This application uses a trained classification model (Random Forest, Gradient Boosting, or Logistic Regression)
        to predict the spoilage status of Roti based on storage and sensory conditions.
        The underlying model incorporates expert logic, such as a high risk of spoilage if kept
        at room temperature for more than 24 hours.
        """
    )

    pipeline = load_model()
    if pipeline is None:
        return

    # Define the exact categories used in training (Crucial for one-hot encoding consistency)
    storage_locations = ['Room Temperature', 'Refrigerator', 'Freezer', 'Open Counter', 'Lunchbox']
    storage_container = ['Airtight Box', 'Aluminium Foil Wrap', 'Cloth/Basket', 'Ziploc Bag', 'Open Plate']
    fat_content = ['Low (0-5%)', 'Medium (5-10%)', 'High (>10%)']
    ambient_season = ['Warm & Humid', 'Cool & Dry', 'Neutral', 'Monsoon (Very Humid)']
    observed_texture = ['Soft & Pliable', 'Slightly Hardened', 'Dry & Brittle', 'Slimy/Sticky', 'Fuzzy/Mold']
    observed_appearance = ['Golden Brown', 'Lightly Spotted', 'Dark Patches', 'Oil Separation/Condensation', 'Visible Fuzz/Growth']

    # --- Sidebar for Inputs (Constraints Applied) ---
    st.sidebar.header("Input Parameters")

    # Time Constraint: 0 to 72 hours (max survival time)
    time_since_cooking_hr = st.sidebar.slider(
        'Time Since Cooking (Hours)',
        min_value=0.0, max_value=72.0, value=6.0, step=0.5,
        help="Input range constrained to 0-72 hours as per spoilage limits."
    )

    # Categorical Select Boxes
    location = st.sidebar.selectbox('Storage Location', storage_locations, index=0)
    container = st.sidebar.selectbox('Storage Container', storage_container, index=0)
    fat = st.sidebar.selectbox('Fat Content', fat_content, index=1)
    season = st.sidebar.selectbox('Ambient Season', ambient_season, index=2)
    texture = st.sidebar.selectbox('Observed Texture', observed_texture, index=0)
    appearance = st.sidebar.selectbox('Observed Appearance', observed_appearance, index=0)

    # --- Prediction Button and Output ---
    st.header("Prediction Result")

    if st.button("Check Spoilage Status", type="primary"):
        with st.spinner('Analyzing Roti data...'):
            time.sleep(1) # Simulate processing time

            # 1. Create input DataFrame (MUST match column names of training data)
            input_data = pd.DataFrame([{
                'time_since_cooking_hr': time_since_cooking_hr,
                'storage_location': location,
                'storage_container': container,
                'fat_content': fat,
                'ambient_season': season,
                'observed_texture': texture,
                'observed_appearance': appearance,
            }])

            # 2. Predict using the loaded pipeline
            try:
                # Predict the class (0: Fresh, 1: Spoiled)
                prediction = pipeline.predict(input_data)[0]
                # Predict the probability for confidence
                probability = pipeline.predict_proba(input_data)[0]

                is_spoiled = (prediction == 1)
                # Confidence is the probability of the predicted class
                confidence = probability[1] if is_spoiled else probability[0]

                # 3. Display Result (High-Quality Output)
                if is_spoiled:
                    st.markdown(f"""
                    <div style="background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-left: 5px solid #721c24; padding: 20px; border-radius: 8px;">
                        <h3 style="margin-top: 0; color: #721c24;">🚨 YES, the food is spoiled.</h3>
                        <p style="font-size: 1.1em;">Based on the provided inputs, the roti is highly likely to be unsafe for consumption.</p>
                        <p><strong>Confidence:</strong> {confidence*100:.2f}%</p>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.markdown(f"""
                    <div style="background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; border-left: 5px solid #155724; padding: 20px; border-radius: 8px;">
                        <h3 style="margin-top: 0; color: #155724;">✅ No, the food is not spoiled.</h3>
                        <p style="font-size: 1.1em;">The roti appears to be fresh and safe under these conditions.</p>
                        <p><strong>Confidence:</strong> {confidence*100:.2f}%</p>
                    </div>
                    """, unsafe_allow_html=True)

                st.subheader("Input Data")
                st.dataframe(input_data.T.rename(columns={0: "Value"}))


            except Exception as e:
                st.error(f"An error occurred during prediction. Please check the model file integrity: {e}")

if __name__ == '__main__':
    main()