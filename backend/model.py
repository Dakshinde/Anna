# model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, mean_squared_error
import pickle

# Load dataset
df = pd.read_csv('dataset.csv')

# Feature and target setup
X = df[['temperature', 'moisture', 'gas']]
y_classification = df['spoiled']
y_regression = df['time_to_spoil']

# Split data
X_train_clf, X_test_clf, y_train_clf, y_test_clf = train_test_split(X, y_classification, test_size=0.2, random_state=42)
non_spoiled_df = df[df['spoiled'] == 0]
X_train_reg, X_test_reg, y_train_reg, y_test_reg = train_test_split(
    non_spoiled_df[['temperature', 'moisture', 'gas']],
    non_spoiled_df['time_to_spoil'],
    test_size=0.2, random_state=42
)

# Scale data
scaler = StandardScaler()
X_train_clf = scaler.fit_transform(X_train_clf)
X_test_clf = scaler.transform(X_test_clf)
X_train_reg = scaler.fit_transform(X_train_reg)
X_test_reg = scaler.transform(X_test_reg)

# Train models
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train_clf, y_train_clf)

reg = RandomForestRegressor(n_estimators=100, random_state=42)
reg.fit(X_train_reg, y_train_reg)

# Evaluate
print(f"Classification Accuracy: {accuracy_score(y_test_clf, clf.predict(X_test_clf)) * 100:.2f}%")
print(f"Regression MSE: {mean_squared_error(y_test_reg, reg.predict(X_test_reg)):.2f}")

# Save models
with open('classifier_model.pkl', 'wb') as f:
    pickle.dump(clf, f)
with open('regressor_model.pkl', 'wb') as f:
    pickle.dump(reg, f)
with open('scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

print("✅ Models saved successfully!")
