import React, { useState, useEffect } from 'react';
import { useUserData } from '../hooks/useUserData';
import { 
  Save, 
  User, 
  Heart, 
  Brain, 
  Activity, 
  Calendar, 
  Clock, 
  Pill, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  X, 
  Check,
  Mail,
  Phone,
  RotateCcw,
  Utensils,
  Dumbbell,
  Moon,
  Smile,
  TrendingUp,
  Shield
} from 'lucide-react';

interface HealthData {
  // Physical Health
  medicalConditions: string[];
  medications: { name: string; dosage: string; frequency: string }[];
  allergies: string[];
  physicalLimitations: string[];
  
  // Mental Health
  moodFactors: string[];
  stressLevel: number;
  sleepHours: number;
  sleepQuality: number;
  anxietyLevel: number;
  
  // Lifestyle
  dietaryRestrictions: string[];
  exerciseFrequency: number;
  exerciseTypes: string[];
  substanceUse: { type: string; frequency: string }[];
  
  // Daily Routines
  wakeUpTime: string;
  bedTime: string;
  mealTimes: { breakfast: string; lunch: string; dinner: string };
}

interface PersonalizationProps {}

const Personalization: React.FC<PersonalizationProps> = () => {
  const { healthData: savedHealthData, emergencyContacts, updateHealthData, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact } = useUserData();
  const [healthData, setHealthData] = useState<HealthData>({
    medicalConditions: [],
    medications: [],
    allergies: [],
    physicalLimitations: [],
    moodFactors: [],
    stressLevel: 5,
    sleepHours: 8,
    sleepQuality: 7,
    anxietyLevel: 3,
    dietaryRestrictions: [],
    exerciseFrequency: 3,
    exerciseTypes: [],
    substanceUse: [],
    wakeUpTime: '07:00',
    bedTime: '23:00',
    mealTimes: { breakfast: '08:00', lunch: '13:00', dinner: '19:00' }
  });

  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    physical: true,
    mental: false,
    lifestyle: false,
    routine: false
  });

  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '' });
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', relationship: '' });

  // Common medical conditions for dropdown
  const commonConditions = [
    'Diabetes', 'Hypertension', 'Asthma', 'Arthritis', 'Depression', 'Anxiety',
    'Heart Disease', 'High Cholesterol', 'Migraine', 'COPD', 'Thyroid Disorder',
    'Chronic Pain', 'Sleep Apnea', 'Epilepsy', 'Osteoporosis'
  ];

  // Common allergies
  const commonAllergies = [
    'Peanuts', 'Tree Nuts', 'Shellfish', 'Fish', 'Milk', 'Eggs', 'Soy', 'Wheat',
    'Pollen', 'Dust Mites', 'Pet Dander', 'Latex', 'Penicillin', 'Aspirin'
  ];

  // Exercise types
  const exerciseOptions = [
    'Walking', 'Running', 'Swimming', 'Cycling', 'Weight Training', 'Yoga',
    'Pilates', 'Dancing', 'Tennis', 'Basketball', 'Soccer', 'Hiking'
  ];

  useEffect(() => {
    // Load saved data from Supabase
    if (savedHealthData) {
      setHealthData({
        medicalConditions: savedHealthData.medical_conditions || [],
        medications: savedHealthData.medications || [],
        allergies: savedHealthData.allergies || [],
        physicalLimitations: savedHealthData.physical_limitations || [],
        moodFactors: savedHealthData.mood_factors || [],
        stressLevel: savedHealthData.stress_level || 5,
        sleepHours: savedHealthData.sleep_hours || 8,
        sleepQuality: savedHealthData.sleep_quality || 7,
        anxietyLevel: savedHealthData.anxiety_level || 3,
        dietaryRestrictions: savedHealthData.dietary_restrictions || [],
        exerciseFrequency: savedHealthData.exercise_frequency || 3,
        exerciseTypes: savedHealthData.exercise_types || [],
        substanceUse: savedHealthData.substance_use || [],
        wakeUpTime: savedHealthData.wake_up_time || '07:00',
        bedTime: savedHealthData.bed_time || '23:00',
        mealTimes: savedHealthData.meal_times || { breakfast: '08:00', lunch: '13:00', dinner: '19:00' }
      });
    }
  }, [savedHealthData]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSave = async () => {
    try {
      await updateHealthData({
        medical_conditions: healthData.medicalConditions,
        medications: healthData.medications,
        allergies: healthData.allergies,
        physical_limitations: healthData.physicalLimitations,
        mood_factors: healthData.moodFactors,
        stress_level: healthData.stressLevel,
        sleep_hours: healthData.sleepHours,
        sleep_quality: healthData.sleepQuality,
        anxiety_level: healthData.anxietyLevel,
        dietary_restrictions: healthData.dietaryRestrictions,
        exercise_frequency: healthData.exerciseFrequency,
        exercise_types: healthData.exerciseTypes,
        substance_use: healthData.substanceUse,
        wake_up_time: healthData.wakeUpTime,
        bed_time: healthData.bedTime,
        meal_times: healthData.mealTimes
      });
      setHasUnsavedChanges(false);
      setShowSaveConfirmation(true);
      setTimeout(() => setShowSaveConfirmation(false), 3000);
    } catch (error) {
      console.error('Error saving health data:', error);
    }
  };

  const addContact = async () => {
    if (newContact.name.trim()) {
      try {
        await addEmergencyContact({
          contact_name: newContact.name,
          contact_email: newContact.email || undefined,
          contact_phone: newContact.phone || undefined,
          relationship: newContact.relationship || undefined,
          is_primary: emergencyContacts.length === 0
        });
        setNewContact({ name: '', email: '', phone: '', relationship: '' });
      } catch (error) {
        console.error('Error adding emergency contact:', error);
      }
    }
  };

  const removeContact = async (id: string) => {
    try {
      await deleteEmergencyContact(id);
    } catch (error) {
      console.error('Error removing emergency contact:', error);
    }
  };

  const handleReset = () => {
    const defaultData: HealthData = {
      medicalConditions: [],
      medications: [],
      allergies: [],
      physicalLimitations: [],
      moodFactors: [],
      stressLevel: 5,
      sleepHours: 8,
      sleepQuality: 7,
      anxietyLevel: 3,
      dietaryRestrictions: [],
      exerciseFrequency: 3,
      exerciseTypes: [],
      substanceUse: [],
      wakeUpTime: '07:00',
      bedTime: '23:00',
      mealTimes: { breakfast: '08:00', lunch: '13:00', dinner: '19:00' }
    };
    setHealthData(defaultData);
    setHasUnsavedChanges(true);
  };

  const addMedication = () => {
    if (newMedication.name.trim()) {
      setHealthData(prev => ({
        ...prev,
        medications: [...prev.medications, { ...newMedication }]
      }));
      setNewMedication({ name: '', dosage: '', frequency: '' });
      setHasUnsavedChanges(true);
    }
  };

  const removeMedication = (index: number) => {
    setHealthData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  const addCondition = (condition: string) => {
    if (condition && !healthData.medicalConditions.includes(condition)) {
      setHealthData(prev => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, condition]
      }));
      setHasUnsavedChanges(true);
    }
  };

  const removeCondition = (condition: string) => {
    setHealthData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter(c => c !== condition)
    }));
    setHasUnsavedChanges(true);
  };

  const addAllergy = (allergy: string) => {
    if (allergy && !healthData.allergies.includes(allergy)) {
      setHealthData(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergy]
      }));
      setHasUnsavedChanges(true);
    }
  };

  const removeAllergy = (allergy: string) => {
    setHealthData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
    setHasUnsavedChanges(true);
  };

  const updateSliderValue = (field: keyof HealthData, value: number) => {
    setHealthData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const SectionHeader = ({ title, icon: Icon, section, count }: { 
    title: string; 
    icon: any; 
    section: string; 
    count?: number;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-6 h-6" />
        <span className="text-lg font-semibold">{title}</span>
        {count !== undefined && (
          <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
            {count} items
          </span>
        )}
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5" />
      ) : (
        <ChevronDown className="w-5 h-5" />
      )}
    </button>
  );

  const SliderInput = ({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 10, 
    unit = '',
    color = 'blue'
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    unit?: string;
    color?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-gray-900">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-${color}`}
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-pink-50 p-6 min-h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Health Profile</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Customize your health information to receive personalized guidance and emergency assistance tailored to your needs.
          </p>
        </div>

        {/* Save Confirmation */}
        {showSaveConfirmation && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3 animate-fade-in">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Health profile saved successfully!</span>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-8 bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm font-semibold text-blue-600">
              {Math.round(((healthData.medicalConditions.length + healthData.medications.length + healthData.allergies.length + emergencyContacts.length) / 12) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(((healthData.medicalConditions.length + healthData.medications.length + healthData.allergies.length + emergencyContacts.length) / 12) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Physical Health Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <SectionHeader 
              title="Physical Health" 
              icon={Heart} 
              section="physical"
              count={healthData.medicalConditions.length + healthData.medications.length + healthData.allergies.length + emergencyContacts.length}
            />
            
            {expandedSections.physical && (
              <div className="p-6 space-y-6">
                {/* Medical Conditions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Medical Conditions</h3>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <select
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a condition...</option>
                        {commonConditions.map(condition => (
                          <option key={condition} value={condition}>{condition}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          addCondition(newCondition);
                          setNewCondition('');
                        }}
                        disabled={!newCondition}
                        className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Or type a custom condition..."
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addCondition(newCondition);
                          setNewCondition('');
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    <div className="flex flex-wrap gap-2">
                      {healthData.medicalConditions.map((condition, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{condition}</span>
                          <button
                            onClick={() => removeCondition(condition)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Medications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Medications & Supplements</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Medication name"
                        value={newMedication.name}
                        onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g., 10mg)"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <select
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Frequency</option>
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="As needed">As needed</option>
                        <option value="Weekly">Weekly</option>
                      </select>
                      <button
                        onClick={addMedication}
                        disabled={!newMedication.name}
                        className="px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {healthData.medications.map((med, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Pill className="w-5 h-5 text-green-600" />
                            <div>
                              <span className="font-medium text-gray-800">{med.name}</span>
                              <span className="text-gray-600 ml-2">{med.dosage}</span>
                              <span className="text-gray-500 ml-2 text-sm">({med.frequency})</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeMedication(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Allergies & Sensitivities</h3>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <select
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select an allergy...</option>
                        {commonAllergies.map(allergy => (
                          <option key={allergy} value={allergy}>{allergy}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          addAllergy(newAllergy);
                          setNewAllergy('');
                        }}
                        disabled={!newAllergy}
                        className="px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Or type a custom allergy..."
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addAllergy(newAllergy);
                          setNewAllergy('');
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    <div className="flex flex-wrap gap-2">
                      {healthData.allergies.map((allergy, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>{allergy}</span>
                          <button
                            onClick={() => removeAllergy(allergy)}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Emergency Contacts</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      <input
                        type="text"
                        placeholder="Contact name"
                        value={newContact.name}
                        onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={newContact.email}
                        onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={newContact.phone}
                        onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <select
                        value={newContact.relationship}
                        onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Relationship</option>
                        <option value="Family">Family</option>
                        <option value="Friend">Friend</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Colleague">Colleague</option>
                        <option value="Neighbor">Neighbor</option>
                        <option value="Other">Other</option>
                      </select>
                      <button
                        onClick={addContact}
                        disabled={!newContact.name}
                        className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {emergencyContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <User className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-800">{contact.contact_name}</span>
                                {contact.is_primary && (
                                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">Primary</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                {contact.contact_email && (
                                  <div className="flex items-center space-x-1">
                                    <Mail className="w-3 h-3" />
                                    <span>{contact.contact_email}</span>
                                  </div>
                                )}
                                {contact.contact_phone && (
                                  <div className="flex items-center space-x-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{contact.contact_phone}</span>
                                  </div>
                                )}
                                {contact.relationship && (
                                  <span className="text-gray-500">({contact.relationship})</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeContact(contact.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mental Health Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <SectionHeader title="Mental Health & Wellness" icon={Brain} section="mental" />
            
            {expandedSections.mental && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SliderInput
                    label="Current Stress Level"
                    value={healthData.stressLevel}
                    onChange={(value) => updateSliderValue('stressLevel', value)}
                    min={1}
                    max={10}
                    color="red"
                  />
                  
                  <SliderInput
                    label="Anxiety Level"
                    value={healthData.anxietyLevel}
                    onChange={(value) => updateSliderValue('anxietyLevel', value)}
                    min={1}
                    max={10}
                    color="yellow"
                  />
                  
                  <SliderInput
                    label="Sleep Hours (per night)"
                    value={healthData.sleepHours}
                    onChange={(value) => updateSliderValue('sleepHours', value)}
                    min={4}
                    max={12}
                    unit=" hrs"
                    color="blue"
                  />
                  
                  <SliderInput
                    label="Sleep Quality"
                    value={healthData.sleepQuality}
                    onChange={(value) => updateSliderValue('sleepQuality', value)}
                    min={1}
                    max={10}
                    color="purple"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Lifestyle Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <SectionHeader title="Lifestyle & Habits" icon={Activity} section="lifestyle" />
            
            {expandedSections.lifestyle && (
              <div className="p-6 space-y-6">
                <SliderInput
                  label="Exercise Frequency (days per week)"
                  value={healthData.exerciseFrequency}
                  onChange={(value) => updateSliderValue('exerciseFrequency', value)}
                  min={0}
                  max={7}
                  unit=" days"
                  color="green"
                />
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Preferred Exercise Types</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {exerciseOptions.map(exercise => (
                      <label key={exercise} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={healthData.exerciseTypes.includes(exercise)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setHealthData(prev => ({
                                ...prev,
                                exerciseTypes: [...prev.exerciseTypes, exercise]
                              }));
                            } else {
                              setHealthData(prev => ({
                                ...prev,
                                exerciseTypes: prev.exerciseTypes.filter(t => t !== exercise)
                              }));
                            }
                            setHasUnsavedChanges(true);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{exercise}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Daily Routine Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <SectionHeader title="Daily Routine" icon={Clock} section="routine" />
            
            {expandedSections.routine && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wake Up Time
                    </label>
                    <input
                      type="time"
                      value={healthData.wakeUpTime}
                      onChange={(e) => {
                        setHealthData(prev => ({ ...prev, wakeUpTime: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bed Time
                    </label>
                    <input
                      type="time"
                      value={healthData.bedTime}
                      onChange={(e) => {
                        setHealthData(prev => ({ ...prev, bedTime: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Meal Times</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(healthData.mealTimes).map(([meal, time]) => (
                      <div key={meal}>
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                          {meal}
                        </label>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => {
                            setHealthData(prev => ({
                              ...prev,
                              mealTimes: { ...prev.mealTimes, [meal]: e.target.value }
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8 pb-8">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={handleSave}
            className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
              hasUnsavedChanges
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!hasUnsavedChanges}
          >
            <Save className="w-5 h-5" />
            <span>Save Health Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Personalization;