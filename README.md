# PediCalc - Pediatric Drug Calculator PWA

A modern, professional Progressive Web App for calculating pediatric medication dosages. Designed for healthcare providers who need quick, accurate, and safe dosage calculations for children.

## ✨ Features

### 🏥 Medical Functionality
- **Accurate Dosage Calculations** - Weight-based pediatric dosing with safety range indicators
- **Comprehensive Drug Database** - Common pediatric medications with dosing guidelines
- **Safety Warnings** - Color-coded safety indicators (green/yellow/red) with maximum dose alerts
- **Multiple Units** - Support for kg/lbs weight and years/months/days age input
- **Volume Calculations** - Automatic liquid medication volume calculations

### 📱 Modern PWA Experience
- **Installable** - Add to home screen like a native app
- **Offline Support** - Core calculations work without internet connection
- **Responsive Design** - Optimized for mobile devices and tablets
- **Touch-Friendly** - Haptic feedback simulation and large touch targets
- **Fast Loading** - Cached resources for instant startup

### 🎨 Stunning UI/UX
- **Medical Theme** - Professional blue color scheme (#2563EB)
- **Smooth Animations** - Polished transitions and micro-interactions
- **Gradient Backgrounds** - Beautiful medical-themed gradients
- **Progress Indicators** - Clear step-by-step calculation flow
- **Card-Based Layout** - Clean, modern interface design

## 🚀 Technology Stack

- **React 19** - Latest React with modern hooks and features
- **TypeScript** - Type-safe development
- **Vite 6** - Fast build tool and development server
- **Tailwind CSS V4** - Modern utility-first CSS framework
- **ShadCN UI** - High-quality component library
- **Lucide Icons** - Beautiful, consistent icon set
- **Service Worker** - Offline functionality and caching

## 🏗️ PWA Features

### Installability
- Web App Manifest with all required fields
- Service Worker for offline functionality
- Install prompt with custom UI
- App shortcuts for quick actions

### Offline Support
- Cached medication database
- Core calculation engine works offline
- Offline fallback page
- Background sync capability (future feature)

### Mobile Optimization
- iOS Safari PWA support
- Android Chrome PWA support
- Safe area handling for notched devices
- Touch-optimized interactions

## 🎯 Target Users

- **Pediatricians** - Quick dosage calculations during consultations
- **Nurses** - Medication administration in pediatric units
- **Pharmacists** - Verification of pediatric prescriptions
- **Medical Students** - Learning pediatric dosing principles
- **Emergency Medicine** - Rapid dosing in critical situations

## 📊 Included Medications

Currently includes 6 common pediatric medications:

1. **Amoxicillin** - Antibiotic for bacterial infections
2. **Azithromycin** - Macrolide antibiotic for respiratory infections
3. **Ibuprofen** - NSAID for pain and inflammation
4. **Ceftriaxone** - Third-generation cephalosporin
5. **Acetaminophen** - Analgesic and antipyretic
6. **Prednisolone** - Anti-inflammatory corticosteroid

Each medication includes:
- Multiple concentration options
- Dosing ranges (min/max mg/kg)
- Frequency guidelines
- Maximum dose limits
- Safety warnings

## 🔒 Safety Features

- **Dosage Range Validation** - Prevents under/overdosing
- **Maximum Dose Alerts** - Warns when exceeding safe limits
- **Visual Safety Indicators** - Color-coded safety status
- **Double-Check Workflows** - Confirmation steps for critical calculations
- **Clear Instructions** - Detailed administration guidance

## 🎨 Design Principles

### Safety First
- Clear visual hierarchy to prevent errors
- Prominent safety warnings and alerts
- Confirmation dialogs for critical calculations
- Color-coded safety ranges

### Simplicity & Clarity
- Minimal cognitive load with clean interface
- Large, touch-friendly buttons and inputs
- Clear typography with high contrast
- Intuitive navigation flow

### Accessibility
- High contrast ratios (4.5:1 minimum)
- Screen reader compatibility
- Support for various font sizes
- Logical tab order and keyboard navigation

### Mobile-First
- Responsive design for all devices
- Touch-optimized interactions
- Thumb-friendly navigation zones
- Portrait and landscape support

## 🔮 Future Enhancements

- **Extended Drug Database** - More medications and categories
- **User Authentication** - Healthcare provider profiles
- **Calculation History** - Save and review past calculations
- **Drug Interactions** - Interaction warnings and alerts
- **Cloud Sync** - Sync data across devices
- **Analytics** - Usage insights for administrators
- **Push Notifications** - Drug updates and alerts
- **Print/Export** - Generate calculation reports

## ⚠️ CRITICAL MEDICAL DISCLAIMER

**FOR HEALTHCARE PROFESSIONALS ONLY**

This application is a clinical decision support tool intended EXCLUSIVELY for qualified healthcare professionals with appropriate training in pediatric medicine and pharmacology. 

**IMPORTANT LIMITATIONS:**
- This software is NOT a substitute for clinical judgment, medical training, or professional medical advice
- All calculations MUST be independently verified before medication administration
- Users remain fully responsible for all clinical decisions and patient safety
- This software has not been evaluated by regulatory authorities as a medical device
- No warranty is provided - use at your own professional risk

**LIABILITY:** The developers, contributors, and distributors accept NO LIABILITY for any direct, indirect, incidental, or consequential damages arising from the use of this application, including but not limited to patient harm, medical errors, or adverse outcomes.

**COMPLIANCE:** Users are responsible for ensuring compliance with local regulations, institutional policies, and professional standards. In emergency situations, follow established protocols and do not rely solely on this application.

**By using this application, you acknowledge that you are a qualified healthcare professional and accept full responsibility for all clinical decisions.**

## 📱 Installation

### Web Browser
1. Visit the PWA URL in a modern browser
2. Look for "Install" or "Add to Home Screen" prompt
3. Follow browser-specific installation steps

### iOS Safari
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Confirm installation

### Android Chrome
1. Open the app in Chrome
2. Tap the menu (⋮) button
3. Select "Add to Home screen"
4. Or use the automatic install banner

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📄 License

This project is developed for educational and professional healthcare use. Please ensure compliance with local medical device regulations and institutional policies before clinical use.

---

**Built with ❤️ for Healthcare Professionals**

*Accurate • Safe • Fast • Professional*