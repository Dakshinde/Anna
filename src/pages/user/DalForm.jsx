import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  // Icons
  Hourglass,
  Clock,
  Wind,
  Eye,
  Archive,
  Thermometer,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldOff,
  Droplets,
  CalendarDays,
  Package,
} from 'lucide-react';

// ==================================================================
// --- DAL CONSTANTS (from your Streamlit spec) ---
// ==================================================================
const dalStoragePlaces = ['Room Temperature', 'Refrigerator', 'Freezer'];
const dalSmellOptions = ['Normal', 'Slightly Sour', 'Very Sour', 'Musty', 'Foul'];
const dalConsistencyOptions = ['Normal', 'Slightly Thickened', 'Watery', 'Slimy'];
const dalAciditySourceOptions = ['Low/Normal', 'Moderate', 'High'];
const dalContainerTypeOptions = ['Steel/Metal', 'Plastic', 'Ceramic/Glass', 'Other'];
const DAL_HOURS_CAP = 120; // 120 hours (5 days) max from your spec

// ==================================================================
// --- DAL FORM ---
// ==================================================================
export const DalForm = ({ handleBack, setResult, setLoading, setApiError, stepVariants, loading }) => {

  // --- Internal State ---
  const [formData, setFormData] = useState({
    // Keys MUST match the payload for app.py
    Time_since_preparation_hours: '',
    Storage_place: dalStoragePlaces[0],
    Acidity_source: dalAciditySourceOptions[0],
    Consistency: dalConsistencyOptions[0],
    Container_type: dalContainerTypeOptions[0],
    Smell: dalSmellOptions[0],
    Oil_separation: '0.0',
  });
  const [errors, setErrors] = useState({});

  // --- Validation ---
  const validateForm = useCallback((isSubmitting = false) => {
    const newErrors = {};
    const { Time_since_preparation_hours, Oil_separation } = formData;

    // Validate Hours
    if (Time_since_preparation_hours !== '' || isSubmitting) {
        const hours = parseFloat(Time_since_preparation_hours);
       if (isNaN(hours) || hours < 0) {
           newErrors.Time_since_preparation_hours = 'Must be a valid number (0 or more).';
        } else if (hours > DAL_HOURS_CAP) {
            newErrors.Time_since_preparation_hours = `Cannot exceed ${DAL_HOURS_CAP} hours (5 days).`;
        }
    }
    if (isSubmitting && Time_since_preparation_hours.trim() === '') {
         newErrors.Time_since_preparation_hours = 'This field is required.';
    }

    // Validate Oil Separation
    if (Oil_separation !== '' || isSubmitting) {
        const oil = parseFloat(Oil_separation);
       if (isNaN(oil) || oil < 0 || oil > 1.0) {
           newErrors.Oil_separation = 'Must be a number between 0.0 and 1.0.';
        }
    }
    if (isSubmitting && Oil_separation.trim() === '') {
         newErrors.Oil_separation = 'This field is required.';
    }

    // Check required dropdowns on submit
    if (isSubmitting) {
      if (!formData.Storage_place) newErrors.Storage_place = 'Please select location.';
      if (!formData.Acidity_source) newErrors.Acidity_source = 'Please select acidity.';
      if (!formData.Consistency) newErrors.Consistency = 'Please select consistency.';
      if (!formData.Container_type) newErrors.Container_type = 'Please select container.';
      if (!formData.Smell) newErrors.Smell = 'Please select smell.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);


  // --- Real-time Validation Effect ---
  useEffect(() => {
    validateForm(false);
  }, [formData, validateForm]);


  // --- Event Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Input validation for number fields
    if (name === 'Time_since_preparation_hours' || name === 'Oil_separation') {
      if (value.length > 5) return; // Limit length (e.g., 120.0)
      if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Serial Flow / Submit Button Disabling Logic ---
  const canSubmit = useMemo(() => {
     return (
       formData.Time_since_preparation_hours.trim() !== '' &&
       formData.Oil_separation.trim() !== '' &&
       formData.Storage_place &&
       formData.Acidity_source &&
       formData.Consistency &&
       formData.Container_type &&
       formData.Smell &&
       Object.keys(errors).length === 0
     );
   }, [formData, errors]);


  // --- API Call ---
  const handlePredict = async () => {
    setApiError(null);
    setResult(null);

    if (!validateForm(true)) {
        console.log("Final validation failed (Dal)", errors);
        return;
    }

    setLoading(true);
    try {
      const payload = {
        Time_since_preparation_hours: parseFloat(formData.Time_since_preparation_hours),
        Storage_place: formData.Storage_place,
        Acidity_source: formData.Acidity_source,
        Consistency: formData.Consistency,
        Container_type: formData.Container_type,
        Smell: formData.Smell,
        Oil_separation: parseFloat(formData.Oil_separation),
      };

      console.log("Sending Dal Payload:", payload);

      const res = await fetch('http://localhost:5000/api/predict/dal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
           console.error("API Error Response (Dal):", data);
           throw new Error(data.error || `Request failed with status ${res.status}`);
      }
      setResult(data); // Expects { status, message, is_safe }

    } catch (err) {
      console.error("Fetch Error (Dal):", err);
      setApiError(err.message.includes('Failed to fetch') ? 'Cannot connect to the prediction service.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  // Determine which fields should be enabled based on previous valid inputs
  const hoursValid = formData.Time_since_preparation_hours.trim() !== '' && !errors.Time_since_preparation_hours;
  const storageValid = formData.Storage_place && hoursValid;
  const smellValid = formData.Smell && storageValid;
  const consistencyValid = formData.Consistency && smellValid;
  const acidityValid = formData.Acidity_source && consistencyValid;
  const containerValid = formData.Container_type && acidityValid;
  // const oilValid = formData.Oil_separation.trim() !== '' && !errors.Oil_separation && containerValid; (Used by canSubmit)


  return (
    <motion.div
      key="step-dal"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="py-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1"> 
        <InputGroup
          label="Time Since Preparation (Hours)"
          name="Time_since_preparation_hours"
          type="number" 
          value={formData.Time_since_preparation_hours}
          onChange={handleChange}
          icon={<Hourglass className="w-5 h-5 text-gray-400" />}
          error={errors.Time_since_preparation_hours}
          placeholder="e.g., 6"
          maxLength={5}
          max={DAL_HOURS_CAP}
          helperText={`Max: ${DAL_HOURS_CAP} hours (5 days)`}
        />
        <SelectGroup
          label="Storage Place"
          name="Storage_place"
          value={formData.Storage_place}
          onChange={handleChange}
          icon={<Archive className="w-5 h-5 text-gray-400" />}
          error={errors.Storage_place}
          disabled={!hoursValid} 
        >
          {dalStoragePlaces.map(o => (<option key={o} value={o}>{o}</option>))}
        </SelectGroup>
        <SelectGroup
          label="Smell"
          name="Smell"
          value={formData.Smell}
          onChange={handleChange}
          icon={<Wind className="w-5 h-5 text-gray-400" />}
          error={errors.Smell}
          disabled={!storageValid} 
        >
          {dalSmellOptions.map(o => (<option key={o} value={o}>{o}</option>))}
        </SelectGroup>
        <SelectGroup
          label="Consistency"
          name="Consistency"
          value={formData.Consistency}
          onChange={handleChange}
          icon={<Droplets className="w-5 h-5 text-gray-400" />}
          error={errors.Consistency}
          disabled={!smellValid} 
        >
          {dalConsistencyOptions.map(o => (<option key={o} value={o}>{o}</option>))}
        </SelectGroup>
        <SelectGroup
          label="Acidity / Taste"
          name="Acidity_source"
          value={formData.Acidity_source}
          onChange={handleChange}
          icon={<AlertCircle className="w-5 h-5 text-gray-400" />}
          error={errors.Acidity_source}
          disabled={!consistencyValid} 
        >
          {dalAciditySourceOptions.map(o => (<option key={o} value={o}>{o}</option>))}
        </SelectGroup>
        <SelectGroup
          label="Container Type"
          name="Container_type"
          value={formData.Container_type}
          onChange={handleChange}
          icon={<Package className="w-5 h-5 text-gray-400" />}
          error={errors.Container_type}
          disabled={!acidityValid} 
        >
          {dalContainerTypeOptions.map(o => (<option key={o} value={o}>{o}</option>))}
        </SelectGroup>
        <InputGroup
          label="Oil/Water Separation (0.0 to 1.0)"
          name="Oil_separation"
          type="number"
          value={formData.Oil_separation}
          onChange={handleChange}
          icon={<Eye className="w-5 h-5 text-gray-400" />}
          error={errors.Oil_separation}
          placeholder="0.0"
          maxLength={3}
          max={1.0}
          step={0.1}
          helperText="0.0 = None, 1.0 = Significant"
          disabled={!containerValid}
        />
      </div>

      <div className="flex justify-between items-center mt-10">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={handlePredict}
          disabled={loading || !canSubmit}
          className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed min-w-[180px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Predict Freshness'
          )}
        </button>
      </div>
    </motion.div>
  );
};


// ==================================================================
// --- HELPER COMPONENTS (COPIED FROM UserPredictPage.jsx) ---
// ==================================================================

// --- InputGroup ---
const InputGroup = ({ label, name, type, value, onChange, icon, error, placeholder, helperText, maxLength, max, disabled = false, step = "any" }) => (
    <div className="mb-0"> 
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> 
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10"> 
          {icon}
        </div>
        <input
          id={name}
          name={name}
          type={type} 
          inputMode={type === 'number' ? 'decimal' : 'text'} 
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          max={max} 
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-2.5 rounded-md border-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 shadow-sm
            ${error
              ? 'border-red-400 dark:border-red-600 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500' 
            }
            ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : 'hover:border-gray-400 dark:hover:border-gray-500'} 
          `}
          step={type === 'number' ? step : undefined}
        />
      </div>
      <div className="mt-1 min-h-[1.1em] text-xs"> 
          {error && <p className="text-red-600 dark:text-red-400 flex items-center"><AlertCircle size={14} className="mr-1 flex-shrink-0" /> {error}</p>}
          {!error && helperText && <p className="text-gray-500 dark:text-gray-400">{helperText}</p>}
      </div>
    </div>
  );

// --- SelectGroup ---
const SelectGroup = ({ label, name, value, onChange, icon, error, children, helperText, disabled = false }) => (
    <div className="mb-0"> 
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> 
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          {icon}
        </div>
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full pl-10 pr-10 py-2.5 rounded-md border-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 shadow-sm
             ${error
               ? 'border-red-400 dark:border-red-600 focus:border-red-500 focus:ring-red-500'
               : 'border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500'
             }
             ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : 'hover:border-gray-400 dark:hover:border-gray-500'}
             ${!value ? 'text-gray-400 dark:text-gray-500' : ''} 
          `}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
       <div className="mt-1 min-h-[1.1em] text-xs"> 
          {error && <p className="text-red-600 dark:text-red-400 flex items-center"><AlertCircle size={14} className="mr-1 flex-shrink-0" /> {error}</p>}
          {!error && helperText && <p className="text-gray-500 dark:text-gray-400">{helperText}</p>}
      </div>
    </div>
  );