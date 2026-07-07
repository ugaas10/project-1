import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'so' | 'en';

interface Translation {
  dashboard: string;
  projects: string;
  mapView: string;
  documents: string;
  files: string;
  storage: string;
  search: string;
  approvals: string;
  aiAssistant: string;
  analytics: string;
  timeline: string;
  settings: string;
  admin: string;
  webapps: string;
  welcomeBack: string;
  totalProjects: string;
  pendingReviews: string;
  efficiencyRatio: string;
  systemHealth: string;
  activeProjects: string;
  notifications: string;
  uploadDocument: string;
  newProject: string;
  searchPlaceholder: string;
  markAllRead: string;
  viewAll: string;
  language: string;
  darkMode: string;
  apiKeyRequired: string;
  addApiKeyDesc: string;
  locationCaptured: string;
  locating: string;
  takePoint: string;
  yourLocation: string;
  delete: string;
  viewProjectFiles: string;
  noProjectsFound: string;
  adjustFilters: string;
  geolocationError: string;
  voiceAssistant: string;
  listening: string;
  voiceCommandHelp: string;
  commandExecuted: string;
  commandNotRecognized: string;
  howToFixMap: string;
  step1Key: string;
  step2Secrets: string;
  step3Name: string;
  step4Value: string;
  rebuildNote: string;
  mapLegend: string;
  projectSite: string;
  cadastralParcel: string;
  onTrack: string;
  delayed: string;
  otherStatus: string;
  noResults: string;
  mapSearchPlaceholder: string;
  overlays: string;
  traffic: string;
}

const translations: Record<Language, Translation> = {
  so: {
    dashboard: 'Dashboard',
    projects: 'Mashaariicda',
    mapView: 'Khariidadda',
    documents: 'Dukumiintiyada',
    files: 'Faylasha',
    storage: 'Kaydka Daruurta',
    search: 'Raadi',
    approvals: 'Anshaxinta',
    aiAssistant: 'AI Caawiye',
    analytics: 'Falanqaynta',
    timeline: 'Jadwalka Shaqada',
    settings: 'Dejinta',
    admin: 'Maamulka',
    webapps: 'Codsiyada Web-ka',
    welcomeBack: 'Kusoo dhawaada mar kale',
    totalProjects: 'Wadarta Mashaariicda',
    pendingReviews: 'Reviews Sugaya',
    efficiencyRatio: 'Heerka Shaqada',
    systemHealth: 'Caafimaadka Nidaamka',
    activeProjects: 'Mashaariicda Socda',
    notifications: 'Ogeysiysiisyada',
    uploadDocument: 'Soo geli Dukumiinti',
    newProject: 'Mashruuc Cusub',
    searchPlaceholder: 'Wax raadi... (Ctrl + K)',
    markAllRead: 'Dhammaan akhri',
    viewAll: 'Arag dhammaan',
    language: 'Luqadda',
    darkMode: 'Mugdi iyo Iftiin',
    apiKeyRequired: 'Fure Google Maps ayaa loo baahan yahay',
    addApiKeyDesc: 'Fadlan ku dar GOOGLE_MAPS_PLATFORM_KEY. Hubi in "Maps JavaScript API" uu shidan yahay, "Billing" uu jiro, iyo inaan "Referrer Restrictions" ay u ogolyihiin app-ka.',
    locationCaptured: 'Goobta waa la qabtay',
    locating: 'Raadinaya...',
    takePoint: 'Qaado Point',
    yourLocation: 'Goobtaada (Live)',
    delete: 'Tirtir',
    viewProjectFiles: 'Arag Faylasha Mashruuca',
    noProjectsFound: 'Mashaariic lama helin',
    adjustFilters: 'Bedel filtarrada si aad u aragto mashaariicda khariidadda.',
    geolocationError: 'Saacidu ma awoodin inay hesho goobtaada. Fadlan hubi ogolaanshaha.',
    voiceAssistant: 'Voice Assistant',
    listening: 'Waan ku maqlayaa...',
    voiceCommandHelp: 'Dheh "fur mashaariicda" ama "raadi [erey]"',
    commandExecuted: 'Awaamiirta waa la fuliyay',
    commandNotRecognized: 'Awaamiirta lama fahmin',
    howToFixMap: 'Sida loo xaliyo khariidadda:',
    step1Key: '1. Fur Settings (icon-ka ⚙️, dhanka sare midig)',
    step2Secrets: '2. Tag tab-ka "Secrets"',
    step3Name: '3. Sameey fure (Secret) magaciisu yahay "GOOGLE_MAPS_PLATFORM_KEY"',
    step4Value: '4. Geli furahaaga (API Key) meesha qoraalka, kadibna Riix Enter/Key si uu app-ka dib ugu dhismo.',
    rebuildNote: 'App-ka si toos ah ayuu isku cusboonaysiin doonaa marka aad dhameysid.',
    mapLegend: 'Sharaxaadda Khariidadda',
    projectSite: 'Goobta Mashruuca',
    cadastralParcel: 'Sahan Parcel (D3)',
    onTrack: 'Mashruuca Hagaagsan',
    delayed: 'Dib u dhac jiro',
    otherStatus: 'Xaalad kale',
    noResults: 'Natiijo lama helin',
    mapSearchPlaceholder: 'Raadi mashaariicda...',
    overlays: 'Daboolka Khariidadda',
    traffic: 'Gawaarida/Mashquulka',
  },
  en: {
    dashboard: 'Dashboard',
    projects: 'Projects',
    mapView: 'Map View',
    documents: 'Documents',
    files: 'Files',
    storage: 'Cloud Storage',
    search: 'Search',
    approvals: 'Approvals',
    aiAssistant: 'AI Assistant',
    analytics: 'Analytics',
    timeline: 'Timeline',
    settings: 'Settings',
    admin: 'Admin',
    webapps: 'Web Applications',
    welcomeBack: 'Welcome back',
    totalProjects: 'Total Projects',
    pendingReviews: 'Pending Reviews',
    efficiencyRatio: 'Efficiency Ratio',
    systemHealth: 'System Health',
    activeProjects: 'Active Projects',
    notifications: 'Notifications',
    uploadDocument: 'Upload Document',
    newProject: 'New Project',
    searchPlaceholder: 'Search anything... (Ctrl + K)',
    markAllRead: 'Mark all read',
    viewAll: 'View All',
    language: 'Language',
    darkMode: 'Dark Mode',
    apiKeyRequired: 'Google Maps API Key Required',
    addApiKeyDesc: 'Please add your GOOGLE_MAPS_PLATFORM_KEY. Ensure "Maps JavaScript API" is enabled, Billing is active, and no Referrer Restrictions are blocking the load.',
    locationCaptured: 'Location captured successfully',
    locating: 'Locating...',
    takePoint: 'Take Point',
    yourLocation: 'Your Location (Live)',
    delete: 'Delete',
    viewProjectFiles: 'View Project Files',
    noProjectsFound: 'No Projects Found',
    adjustFilters: 'Adjust your filters to see projects on the map.',
    geolocationError: 'Unable to retrieve your location. Please check your permissions.',
    voiceAssistant: 'Voice Assistant',
    listening: 'Listening...',
    voiceCommandHelp: 'Say "open projects" or "search for [term]"',
    commandExecuted: 'Command executed',
    commandNotRecognized: 'Command not recognized',
    howToFixMap: 'How to enable the Map:',
    step1Key: '1. Open Settings (⚙️ icon, top-right)',
    step2Secrets: '2. Go to Secrets tab',
    step3Name: '3. Create a secret named GOOGLE_MAPS_PLATFORM_KEY',
    step4Value: '4. Paste your API Key and press Enter. The app will rebuild automatically.',
    rebuildNote: 'No page refresh needed - the new key is applied during the rebuild.',
    mapLegend: 'Map Legend',
    projectSite: 'Project Site',
    cadastralParcel: 'Cadastral Parcel (D3)',
    onTrack: 'On Track',
    delayed: 'Delayed',
    otherStatus: 'Other Status',
    noResults: 'No results found',
    mapSearchPlaceholder: 'Search projects...',
    overlays: 'Overlays',
    traffic: 'Traffic',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translation) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      return saved || 'so';
    }
    return 'so';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: keyof Translation) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
