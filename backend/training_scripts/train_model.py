import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import seaborn as sns
import matplotlib.pyplot as plt
import os

print("--- Starting Model Training ---")

# --- PATH UPDATES ---
# Define paths relative to the script's location in training_scripts/
DATA_PATH = os.path.join('..', 'data', 'final_dataset.csv')
MODEL_SAVE_PATH = os.path.join('..', 'models', 'food_spoilage_model.joblib')
OUTPUT_IMAGE_PATH = os.path.join('..', 'confusion_matrix.png')

# 1. Load the Dataset
try:
    df = pd.read_csv(DATA_PATH)
    print(f"✅ Dataset loaded successfully from '{DATA_PATH}'.")
except FileNotFoundError:
    print(f"❌ Error: '{DATA_PATH}' not found. Make sure the file exists.")
    exit()

# 2. Prepare Data
X = df.drop(['spoiled', 'time_to_spoil'], axis=1)
y = df['spoiled']
print(f"Features (X) shape: {X.shape}")
print(f"Target (y) shape: {y.shape}")

# 3. Preprocessing
categorical_features = ['food_type']
numerical_features = ['temperature', 'moisture', 'gas']
preprocessor = ColumnTransformer(
    transformers=[
        ('num', 'passthrough', numerical_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ],
    remainder='passthrough'
)

# 4. Split Data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
print("✅ Data split into training and testing sets.")

# 5. Define and Train the Model
model_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])
print("⏳ Training the RandomForestClassifier model...")
model_pipeline.fit(X_train, y_train)
print("✅ Model training complete.")

# 6. Evaluate the Model
print("\n--- Model Evaluation ---")
y_pred = model_pipeline.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy on Test Set: {accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Generate and save the confusion matrix
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Not Spoiled', 'Spoiled'], yticklabels=['Not Spoiled', 'Spoiled'])
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Confusion Matrix')
plt.savefig(OUTPUT_IMAGE_PATH)
print(f"✅ Confusion matrix plot saved as '{OUTPUT_IMAGE_PATH}'.")

# 7. Save the Model
joblib.dump(model_pipeline, MODEL_SAVE_PATH)
print(f"\n✅ Model pipeline saved successfully as '{MODEL_SAVE_PATH}'")
print("\n--- Training Script Finished ---")
