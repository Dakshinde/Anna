import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Hourglass,
  Archive,
  Package,
  Droplets,
  Wind,
  Hand,
  Eye,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// ============================================================
// ROTI CONSTANTS
// ============================================================
const rotiStorageLocations = [
  'Room Temperature',
  'Refrigerator',
  'Freezer',
  'Open Counter',
  'Lunchbox',
];

const rotiStorageContainers = [
  'Airtight Box',
  'Aluminium Foil Wrap',
  'Cloth/Basket',
  'Ziploc Bag',
  'Open Plate',
];

const rotiFatContents = ['Low (0-5%)', 'Medium (5-10%)', 'High (>10%)'];

const rotiAmbientSeasons = [
  'Warm & Humid',
  'Cool & Dry',
  'Neutral',
  'Monsoon (Very Humid)',
];

const rotiObservedTextures = [
  'Soft & Pliable',
  'Slightly Hardened',
  'Dry & Brittle',
  'Slimy/Sticky',
  'Fuzzy/Mold',
];

const rotiObservedAppearances = [
  'Golden Brown',
  'Lightly Spotted',
  'Dark Patches',
  'Oil Separation/Condensation',
  'Visible Fuzz/Growth',
];

const ROTI_HOURS_CAP = 72;

// ============================================================
// COMPONENT
// ============================================================
export const RotiForm = ({
  handleBack,
  setResult,
  setLoading,
  setApiError,
  stepVariants,
  loading,
}) => {
  const [formData, setFormData] = useState({
    time_since_cooking_hr: '',
    storage_location: rotiStorageLocations[0],
    storage_container: rotiStorageContainers[0],
    fat_content: rotiFatContents[1],
    ambient_season: rotiAmbientSeasons[2],
    observed_texture: rotiObservedTextures[0],
    observed_appearance: rotiObservedAppearances[0],
  });

  const [errors, setErrors] = useState({});

  // ============================================================
  // VALIDATION
  // ============================================================
  const validateForm = useCallback(
    (isSubmitting = false) => {
      const newErrors = {};
      const { time_since_cooking_hr } = formData;

      if (time_since_cooking_hr !== '' || isSubmitting) {
        const hours = parseFloat(time_since_cooking_hr);
        if (isNaN(hours) || hours < 0) {
          newErrors.time_since_cooking_hr = 'Must be a valid number (0 or more).';
        } else if (hours > ROTI_HOURS_CAP) {
          newErrors.time_since_cooking_hr = `Cannot exceed ${ROTI_HOURS_CAP} hours (3 days).`;
        }
      }

      if (isSubmitting && time_since_cooking_hr.trim() === '') {
        newErrors.time_since_cooking_hr = 'This field is required.';
      }

      if (isSubmitting) {
        const requiredFields = [
          'storage_location',
          'storage_container',
          'fat_content',
          'ambient_season',
          'observed_texture',
          'observed_appearance',
        ];
        requiredFields.forEach((field) => {
          if (!formData[field]) newErrors[field] = 'This field is required.';
        });
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData]
  );

  useEffect(() => {
    validateForm(false);
  }, [formData, validateForm]);

  // ============================================================
  // EVENT HANDLERS
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'time_since_cooking_hr') {
      if (value.length > 4) return;
      if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const canSubmit = useMemo(() => {
    return (
      formData.time_since_cooking_hr.trim() !== '' &&
      formData.storage_location &&
      formData.storage_container &&
      formData.fat_content &&
      formData.ambient_season &&
      formData.observed_texture &&
      formData.observed_appearance &&
      Object.keys(errors).length === 0
    );
  }, [formData, errors]);

  // ============================================================
  // API CALL
  // ============================================================
  const handlePredict = async () => {
    setApiError(null);
    setResult(null);

    if (!validateForm(true)) return;

    setLoading(true);

    try {
      const payload = {
        time_since_cooking_hr: parseFloat(formData.time_since_cooking_hr),
        storage_location: formData.storage_location,
        storage_container: formData.storage_container,
        fat_content: formData.fat_content,
        ambient_season: formData.ambient_season,
        observed_texture: formData.observed_texture,
        observed_appearance: formData.observed_appearance,
};


      const res = await fetch('http://localhost:5000/api/predict/roti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
      }

      setResult(data);
    } catch (err) {
      const message = err.message.includes('Failed to fetch')
        ? 'Cannot connect to the prediction service.'
        : err.message;
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ENABLED FIELD LOGIC
  // ============================================================
  const hoursValid = formData.time_since_cooking_hr.trim() !== '' && !errors.time_since_cooking_hr;
  const locationValid = formData.storage_location && hoursValid;
  const containerValid = formData.storage_container && locationValid;
  const fatValid = formData.fat_content && containerValid;
  const seasonValid = formData.ambient_season && fatValid;
  const textureValid = formData.observed_texture && seasonValid;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <motion.div
      key="step-roti"
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="py-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <InputGroup
          label="Time Since Cooking (Hours)"
          name="time_since_cooking_hr"
          type="number"
          value={formData.time_since_cooking_hr}
          onChange={handleChange}
          icon={<Hourglass className="w-5 h-5 text-gray-400" />}
          error={errors.time_since_cooking_hr}
          placeholder="e.g., 6"
          maxLength={4}
          max={ROTI_HOURS_CAP}
          helperText={`Max: ${ROTI_HOURS_CAP} hours (3 days)`}
        />

        <SelectGroup
          label="Storage Location"
          name="storage_location"
          value={formData.storage_location}
          onChange={handleChange}
          icon={<Archive className="w-5 h-5 text-gray-400" />}
          error={errors.storage_location}
          disabled={!hoursValid}
        >
          {rotiStorageLocations.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </SelectGroup>

        <SelectGroup
          label="Storage Container"
          name="storage_container"
          value={formData.storage_container}
          onChange={handleChange}
          icon={<Package className="w-5 h-5 text-gray-400" />}
          error={errors.storage_container}
          disabled={!locationValid}
        >
          {rotiStorageContainers.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </SelectGroup>

        <SelectGroup
          label="Fat Content"
          name="fat_content"
          value={formData.fat_content}
          onChange={handleChange}
          icon={<Droplets className="w-5 h-5 text-gray-400" />}
          error={errors.fat_content}
          disabled={!containerValid}
        >
          {rotiFatContents.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </SelectGroup>

        <SelectGroup
          label="Ambient Season"
          name="ambient_season"
          value={formData.ambient_season}
          onChange={handleChange}
          icon={<Wind className="w-5 h-5 text-gray-400" />}
          error={errors.ambient_season}
          disabled={!fatValid}
        >
          {rotiAmbientSeasons.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </SelectGroup>

        <SelectGroup
          label="Observed Texture"
          name="observed_texture"
          value={formData.observed_texture}
          onChange={handleChange}
          icon={<Hand className="w-5 h-5 text-gray-400" />}
          error={errors.observed_texture}
          disabled={!seasonValid}
        >
          {rotiObservedTextures.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </SelectGroup>

        <SelectGroup
          label="Observed Appearance"
          name="observed_appearance"
          value={formData.observed_appearance}
          onChange={handleChange}
          icon={<Eye className="w-5 h-5 text-gray-400" />}
          error={errors.observed_appearance}
          disabled={!textureValid}
        >
          {rotiObservedAppearances.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </SelectGroup>
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

// ============================================================
// HELPER COMPONENTS
// ============================================================
const InputGroup = ({
  label,
  name,
  type,
  value,
  onChange,
  icon,
  error,
  placeholder,
  helperText,
  maxLength,
  max,
  disabled = false,
  step = 'any',
}) => (
  <div className="mb-0">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">{icon}</div>
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
          ${
            error
              ? 'border-red-400 dark:border-red-600 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500'
          }
          ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : 'hover:border-gray-400 dark:hover:border-gray-500'}
        `}
        step={type === 'number' ? step : undefined}
      />
    </div>
    <div className="mt-1 min-h-[1.1em] text-xs">
      {error ? (
        <p className="text-red-600 dark:text-red-400 flex items-center">
          <AlertCircle size={14} className="mr-1 flex-shrink-0" /> {error}
        </p>
      ) : (
        helperText && <p className="text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  </div>
);

const SelectGroup = ({ label, name, value, onChange, icon, error, children, disabled = false }) => (
  <div className="mb-0">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">{icon}</div>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full pl-10 pr-10 py-2.5 rounded-md border-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 shadow-sm
          ${
            error
              ? 'border-red-400 dark:border-red-600 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500'
          }`}
      >
        {children}
      </select>
    </div>
  </div>
);
