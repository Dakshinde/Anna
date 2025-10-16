import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

print("--- Starting Regression Model Training for Shelf Life Prediction ---")

# --- PATH UPDATES ---
DATA_PATH = os.path.join('..', 'data', 'final_dataset.csv')
MODEL_SAVE_PATH = os.path.join('..', 'models', 'food_shelf_life_regressor.joblib')

# 1. Load the Dataset
try:
    df = pd.read_csv(DATA_PATH)
    print(f"✅ Dataset loaded successfully from '{DATA_PATH}'.")
except FileNotFoundError:
    print(f"❌ Error: '{DATA_PATH}' not found. Make sure the file exists.")
    exit()

# 2. Filter for Fresh Food Only
df_fresh = df[df['spoiled'] == 0].copy()
print(f"✅ Filtered for fresh food only. Using {len(df_fresh)} samples for training.")

# 3. Prepare Data
X = df_fresh.drop(['spoiled', 'time_to_spoil'], axis=1)
y = df_fresh['time_to_spoil']
print(f"Features (X) shape: {X.shape}")
print(f"Target (y) shape: {y.shape}")

# 4. Preprocessing
categorical_features = ['food_type']
numerical_features = ['temperature', 'moisture', 'gas']
preprocessor = ColumnTransformer(
    transformers=[
        ('num', 'passthrough', numerical_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ],
    remainder='passthrough'
)

# 5. Split Data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print("✅ Data split into training and testing sets.")

# 6. Define and Train the Regression Model
regressor_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])
print("⏳ Training the RandomForestRegressor model...")
regressor_pipeline.fit(X_train, y_train)
print("✅ Regression model training complete.")

# 7. Evaluate the Model
print("\n--- Regression Model Evaluation ---")
y_pred = regressor_pipeline.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
print(f"Mean Absolute Error (MAE) on Test Set: {mae:.2f} days")
r2 = r2_score(y_test, y_pred)
print(f"R-squared (R²) Score: {r2:.2f}")

# 8. Save the Regression Model
joblib.dump(regressor_pipeline, MODEL_SAVE_PATH)
print(f"\n✅ Regression model pipeline saved successfully as '{MODEL_SAVE_PATH}'")
print("\n--- Regression Training Script Finished ---")
