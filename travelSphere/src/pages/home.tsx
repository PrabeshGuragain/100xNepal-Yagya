import { useState, useRef, useEffect } from 'react';
import { MapPin, FileText, Download, ChevronRight, ChevronLeft, Loader } from 'lucide-react';

declare global {
  interface Window {
    gsap?: any;
  }
}

type FormDataType = {
  destination: string;
  duration: string;
  visitMonth: string;
  startDate: string;
  difficulty: string;
  budget: string;
  regions: string[];
  accessibility: string;
  interests: string[];
  groupSize: string;
  accommodation: string;
  transportation: string;
};

const LOCATION_DETAILS: Record<string, any> = {
  muktinath: {
    title: 'Muktinath, Mustang, Nepal',
    location: 'Muktinath is located in the Mustang district of Nepal, at the foot of the Thorong La mountain pass in the Himalayas.',
    altitude: 'Approximately 3,800 meters (12,467 feet)',
    religiousSignificance: {
      hindu: {
        name: 'Mukti Kshetra',
        deity: 'Lord Vishnu (Shri Mukti Narayana)',
        notes: [
          'One of the 108 Divya Desams (the only one outside India).',
          'Considered one of the eight Svayam Vyakta Ksetras (self-manifested shrines).',
          'Also revered as a Shakti Pitha.'
        ]
      },
      buddhist: {
        name: 'Chumig Gyatsa (Hundred Waters)',
        worship: 'Avalokiteśvara (Bodhisattva of Compassion)',
        notes: [
          'Revered as a sacred site of the Dakinis (Sky Dancers).',
          'Associated with Guru Rinpoche (Padmasambhava) meditation on his way to Tibet.'
        ]
      }
    },
    keyFeatures: [
      '108 Mukti Dharas (stone water spouts shaped like bull heads) — pilgrims bathe here for purification',
      'Two sacred ponds: Lakshmi Kunda and Saraswati Kunda',
      'Jwala Mai Temple with an eternal flame (natural gas) alongside a spring'
    ],
    howToReach: [
      'Fly Kathmandu → Pokhara (25 min), then Pokhara → Jomsom (20–25 min scenic flight). From Jomsom take a jeep (1.5–2 hrs) or trek (6–8 hrs).',
      'By road: Public bus or private jeep from Kathmandu/Pokhara to Jomsom (long, ~8–10 hrs from Pokhara with rough mountain roads).',
      'Helicopter: Chartered services available from Kathmandu or Pokhara.',
      'Trekking: Major stop on the Annapurna Circuit (often reached after Thorong La pass).'
    ],
    bestTimeToVisit: 'Spring (Mar–May) and Autumn (Sep–Nov) — clear skies, stable weather, excellent visibility.',
    avoidSeasons: 'Winter (heavy snow) and Monsoon (landslides, flight disruptions).'
  },
  mustang: {
    title: 'Mustang District, Nepal',
    location: 'Mustang is a remote, high-altitude district in northern Nepal, bordering Tibet.',
    highlights: [
      'Dramatic arid landscapes and canyon-like valleys',
      'Traditional Tibetan-influenced culture and architecture',
      'Gateway to Muktinath and key trekking routes'
    ]
  },
  nepal: {
    title: 'Nepal',
    location: 'Nepal is a Himalayan country in South Asia, home to diverse landscapes.',
    highlights: [
      'Home to eight of the world\'s ten highest peaks, including Mount Everest',
      'Rich cultural and religious heritage (Hinduism and Buddhism)',
      'Popular trekking regions: Annapurna, Everest, Langtang, Manaslu'
    ]
  }
};

const TourismItineraryMaker = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormDataType>({
    destination: '',
    duration: '',
    visitMonth: '',
    startDate: '',
    difficulty: 'moderate',
    budget: 'moderate',
    regions: [] as string[],
    accessibility: 'standard',
    interests: [] as string[],
    groupSize: '2',
    accommodation: 'hotel',
    transportation: 'flexible'
  });
  
  const [itinerary, setItinerary] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);

  // Background images (rotating slideshow)
  const BG_IMAGES = [
    'https://images.unsplash.com/photo-1580424917967-a8867a6e676e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2340',
    'https://images.unsplash.com/photo-1602102488252-c4c3daadf1c2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2348',
    'https://images.unsplash.com/photo-1544442069-97dded965a9f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2831'
  ];
  const [bgIndex, setBgIndex] = useState<number>(0);
  const [cardFading, setCardFading] = useState<boolean>(false);

  // Change background image according to current form step
  useEffect(() => {
    // Keep current image until the new one is fully loaded, then cross-fade.
    const newIndex = (currentStep - 1) % BG_IMAGES.length;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let mounted = true;

    const img = new Image();
    img.src = BG_IMAGES[newIndex];
    img.onload = () => {
      if (!mounted) return;
      // start fade (fade out current)
      setCardFading(true);
      // after fade, swap background and fade in
      timeoutId = setTimeout(() => {
        setBgIndex(newIndex);
        setCardFading(false);
      }, 260);
    };

    // If image fails to load quickly, still swap after a short delay to avoid blocking forever
    const fallback = setTimeout(() => {
      if (!mounted) return;
      // attempt swap even if onload didn't fire
      if (!timeoutId) {
        setCardFading(true);
        timeoutId = setTimeout(() => {
          setBgIndex(newIndex);
          setCardFading(false);
        }, 260);
      }
    }, 3000);

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      clearTimeout(fallback);
      img.onload = null;
    };
  }, [currentStep]);

  useEffect(() => {
    // Load GSAP from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

const animateStepTransition = (direction: 'next' | 'prev') => {
    if (!contentRef.current || isAnimating) return;
    
    setIsAnimating(true);
    const content = contentRef.current;
    
    // Check if GSAP is loaded
    if (typeof window.gsap !== 'undefined') {
        const gsap = window.gsap;
        
        if (direction === 'next') {
            // Slide current content up and fade out, then bring new content up from bottom
            gsap.to(content, {
                opacity: 0,
                y: -50,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    setCurrentStep(prev => Math.min(3, prev + 1));
                    gsap.fromTo(
                        content,
                        { opacity: 0, y: 50 },
                        { 
                            opacity: 1, 
                            y: 0, 
                            duration: 0.4, 
                            ease: 'power2.out',
                            onComplete: () => setIsAnimating(false)
                        }
                    );
                }
            });
        } else {
            // Slide current content down and fade out, then bring new content down from top
            gsap.to(content, {
                opacity: 0,
                y: 50,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    setCurrentStep(prev => Math.max(1, prev - 1));
                    gsap.fromTo(
                        content,
                        { opacity: 0, y: -50 },
                        { 
                            opacity: 1, 
                            y: 0, 
                            duration: 0.4, 
                            ease: 'power2.out',
                            onComplete: () => setIsAnimating(false)
                        }
                    );
                }
            });
        }
    } else {
        // Fallback without GSAP (instant switch)
        if (direction === 'next') {
            setCurrentStep(prev => Math.min(3, prev + 1));
        } else {
            setCurrentStep(prev => Math.max(1, prev - 1));
        }
        setIsAnimating(false);
    }
};

  function handleInputChange<K extends keyof FormDataType>(field: K, value: FormDataType[K]) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  const handleArrayToggle = (field: 'regions' | 'interests', value: string) => {
    setFormData(prev => {
      const arr = prev[field] as string[];
      const updated = arr.includes(value) ? arr.filter(item => item !== value) : [...arr, value];
      return { ...prev, [field]: updated };
    });
  };

  const generatePrompt = () => {
    const required = `Create a detailed ${formData.duration}-day tourism itinerary for ${formData.destination} visiting in ${formData.visitMonth} ${formData.startDate ? `starting from ${formData.startDate}` : ''}.`;
    
    const optional = [];
    if (formData.difficulty !== 'moderate') optional.push(`Difficulty level: ${formData.difficulty}`);
    if (formData.budget !== 'moderate') optional.push(`Budget: ${formData.budget}`);
    if (formData.regions.length > 0) optional.push(`Preferred regions: ${formData.regions.join(', ')}`);
    if (formData.interests.length > 0) optional.push(`Interests: ${formData.interests.join(', ')}`);
    if (formData.groupSize !== '2') optional.push(`Group size: ${formData.groupSize} people`);
    if (formData.accommodation !== 'hotel') optional.push(`Accommodation preference: ${formData.accommodation}`);
    
    return `${required} ${optional.length > 0 ? optional.join('. ') + '.' : ''}`;
  };

  const generateItinerary = async () => {
    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const lookupLocationDetails = (name: string) => {
      const n = (name || '').toLowerCase();
      if (n.includes('muktinath')) return LOCATION_DETAILS.muktinath;
      if (n.includes('mustang')) return LOCATION_DETAILS.mustang;
      if (n.includes('nepal')) return LOCATION_DETAILS.nepal;
      return undefined;
    }
    const locationDetails = lookupLocationDetails(formData.destination);
    
    const days = parseInt(formData.duration);
    const generatedItinerary = {
      destination: formData.destination,
      duration: days,
      month: formData.visitMonth,
      startDate: formData.startDate,
      overview: {
        totalDistance: '240 km',
        difficulty: formData.difficulty,
        budget: formData.budget,
        bestFor: formData.interests.length > 0 ? formData.interests : ['sightseeing', 'culture']
      },
      transportation: {
        toDestination: [
          { type: 'flight', from: 'Kathmandu', to: formData.destination, duration: '1h 15m', price: '$120' },
          { type: 'bus', from: 'Kathmandu', to: formData.destination, duration: '8h', price: '$15' }
        ]
      },
      accommodation: [
        { name: `${formData.destination} Heritage Hotel`, type: 'hotel', rating: 4.5, price: '$80/night', location: 'City Center' },
        { name: `Mountain View Lodge`, type: 'lodge', rating: 4.2, price: '$45/night', location: 'Hillside' }
      ],
      dailyPlan: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        title: i === 0 ? 'Arrival & City Exploration' : i === days - 1 ? 'Departure Day' : `Day ${i + 1} Adventure`,
        schedule: [
          { time: '06:00', activity: 'Wake up & Breakfast', location: 'Hotel Restaurant', duration: '1h' },
          { time: '07:00', activity: i === 0 ? 'City Walking Tour' : `Visit ${formData.interests[0] || 'Temple'}`, location: 'Various locations', duration: '3h', description: 'Explore the rich cultural heritage and historical significance of the area.' },
          { time: '10:00', activity: 'Tea Break', location: 'Local Cafe', duration: '30m' },
          { time: '10:30', activity: 'Continue Exploration', location: 'Heritage Sites', duration: '2.5h' },
          { time: '13:00', activity: 'Lunch', location: 'Traditional Restaurant', duration: '1h', cost: '$12' },
          { time: '14:00', activity: 'Afternoon Activity', location: 'Scenic Point', duration: '3h', description: 'Visit breathtaking viewpoints and capture memorable photos.' },
          { time: '17:00', activity: 'Return to Hotel', location: 'Hotel', duration: '30m' },
          { time: '17:30', activity: 'Rest & Refresh', location: 'Hotel', duration: '1.5h' },
          { time: '19:00', activity: 'Dinner', location: 'Local Cuisine Restaurant', duration: '1.5h', cost: '$15' },
          { time: '20:30', activity: 'Evening Leisure', location: 'Hotel/Local Market', duration: '1.5h' }
        ],
        overnight: i === days - 1 ? 'Departure' : 'City Center Hotel',
        meals: { breakfast: 'Hotel', lunch: 'Restaurant', dinner: 'Local Cuisine' },
        highlights: [
          'UNESCO World Heritage Sites',
          'Traditional Architecture',
          'Local Market Experience',
          'Panoramic Mountain Views'
        ],
        distance: i === 0 || i === days - 1 ? '15 km' : '45 km'
      })),
      importantPlaces: [
        {
          name: `${formData.destination} Durbar Square`,
          type: 'Historical',
          history: 'Built in the 17th century, this square represents the architectural brilliance of ancient craftsmen.',
          significance: 'UNESCO World Heritage Site',
          visitDuration: '2-3 hours',
          entryFee: '$10',
          tips: 'Visit early morning to avoid crowds. Hire a local guide for detailed history.'
        },
        {
          name: 'Mountain Viewpoint',
          type: 'Natural',
          history: 'This viewpoint has been a favorite spot for travelers since ancient trade routes.',
          significance: 'Best sunrise view in the region',
          visitDuration: '1-2 hours',
          entryFee: 'Free',
          tips: 'Bring warm clothes for early morning visits.'
        }
      ],
      essentials: {
        packing: ['Comfortable walking shoes', 'Light jacket', 'Sunscreen', 'Camera', 'Water bottle', 'First aid kit'],
        documents: ['Valid ID', 'Travel insurance', 'Hotel bookings', 'Emergency contacts'],
        budget: {
          accommodation: `$${80 * days}`,
          food: `$${40 * days}`,
          transportation: '$150',
          activities: '$100',
          total: `$${80 * days + 40 * days + 250}`
        }
      },
      map: {
        route: ['Kathmandu → Airport → ' + formData.destination + ' → City Center → Heritage Sites → Mountain Areas → Return'],
        coordinates: '27.7172° N, 85.3240° E'
      },
      locationDetails: locationDetails
    };
    
    setItinerary(generatedItinerary);
    setIsGenerating(false);
    setShowReport(true);
  };

  const handlePrint = () => {
    window.print();
  };


  if (showReport && itinerary) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
            <div className="no-print mb-6 flex justify-between items-center">
            <button
              onClick={() => setShowReport(false)}
              className="flex items-center bg-black gap-2 px-4 py-2 text-white rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
              Back to Form
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Download size={20} />
              Print Report
            </button>
          </div>

          <div ref={printRef} className=" p-8 print:shadow-none">
            <div className="text-center mb-8 border-b pb-6">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{itinerary.destination} Travel Itinerary</h1>
              <p className="text-xl text-gray-600">{itinerary.duration} Days Journey</p>
              <p className="text-gray-500 mt-2">Visiting in {itinerary.month} {itinerary.startDate}</p>
            </div>

            {itinerary.locationDetails && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Location Details</h2>
                <p className="text-sm text-gray-700 mb-2"><strong>Place:</strong> {itinerary.locationDetails.title}</p>
                <p className="text-sm text-gray-700 mb-2"><strong>Location:</strong> {itinerary.locationDetails.location}</p>
                {itinerary.locationDetails.altitude && (
                  <p className="text-sm text-gray-700 mb-2"><strong>Altitude:</strong> {itinerary.locationDetails.altitude}</p>
                )}
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="text-emerald-600" />
                Trip Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-lg font-semibold">{itinerary.duration} Days</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-lg font-semibold">{itinerary.overview.totalDistance}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="text-lg font-semibold capitalize">{itinerary.overview.difficulty}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="text-lg font-semibold capitalize">{itinerary.overview.budget}</p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 border-t pt-6 mt-8">
              <p>Generated on {new Date().toLocaleDateString()}</p>
              <p className="mt-2">Have a wonderful journey! 🌏✈️</p>
            </div>
          </div>
        </div>

        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { margin: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full h-full relative py-8">
      {/* full-screen background for current step (covers entire viewport) */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 ${cardFading ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundImage: `url(${BG_IMAGES[bgIndex]})`
        }}
      />

      {/* subtle overlay to improve readability + centered gradient to focus the form */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-black/50" />
        {/* centered radial gradient to focus the form */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <div
            aria-hidden
            style={{
              width: '90%',
              maxWidth: '1200px',
              height: '80%',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0) 70%)',
              borderRadius: '24px'
            }}
          />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
      {/* form container (transparent) - background image per-step lives on this card */}
      <div
            className={`relative w-full max-w-5xl bg-transparent rounded-xl p-10 overflow-hidden transition-opacity duration-300 ${
              cardFading ? 'opacity-0' : 'opacity-100'
            }`}
          >
          {/* <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800 mb-2 text-emerald-600">
              Tourism Itinerary Maker
            </h1>
            <p className="text-gray-600 text-lg">Plan your perfect journey with AI-powered recommendations</p>
          </div> */}

          {/* <ProgressIndicator /> */}

          <div className="p-8 overflow-hidden relative z-10">
            <div ref={contentRef}>
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white mb-4">Required Information</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    placeholder="e.g., Pokhara, Kathmandu, Muktinath"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="e.g., 5"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Visit Month
                    </label>
                    <select
                      value={formData.visitMonth}
                      onChange={(e) => handleInputChange('visitMonth', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    >
                      <option value="">Select Month</option>
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white mb-4">Your Preferences</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    >
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="challenging">Challenging</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Budget Range
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    >
                      <option value="budget">Budget ($-$$)</option>
                      <option value="moderate">Moderate ($$-$$$)</option>
                      <option value="luxury">Luxury ($$$-$$$$)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-3">
                    Interests (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(() => {
                        const INTERESTS = ['temples', 'trails', 'rivers', 'mountains', 'culture', 'wildlife', 'photography', 'adventure', 'relaxation'];
                        const EMOJI: Record<string, string> = {
                            temples: '🛕',
                            trails: '🥾',
                            rivers: '🌊',
                            mountains: '🏔️',
                            culture: '🎭',
                            wildlife: '🦌',
                            photography: '📸',
                            adventure: '🧗',
                            relaxation: '🧘'
                        };
                        return INTERESTS.map(interest => (
                            <button
                                key={interest}
                                onClick={() => handleArrayToggle('interests', interest)}
                className={`px-4 py-2 rounded-lg border-2 transition-all transform  flex items-center justify-center gap-2 ${
                                    formData.interests.includes(interest)
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-400'
                                }`}
                            >
                                <span aria-hidden>{EMOJI[interest] || '🔹'}</span>
                                <span>{interest.charAt(0).toUpperCase() + interest.slice(1)}</span>
                            </button>
                        ));
                    })()}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Group Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.groupSize}
                      onChange={(e) => handleInputChange('groupSize', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Accommodation Type
                    </label>
                    <select
                      value={formData.accommodation}
                      onChange={(e) => handleInputChange('accommodation', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    >
                      <option value="hotel">Hotel</option>
                      <option value="guesthouse">Guesthouse</option>
                      <option value="resort">Resort</option>
                      <option value="hostel">Hostel</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white mb-4">Review Your Trip Details</h2>
                
                <div className="bg-emerald-50 p-6 rounded-lg space-y-4 border-2 border-emerald-100">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Destination</p>
                      <p className="font-semibold text-lg">{formData.destination || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold text-lg">{formData.duration || 'Not specified'} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Travel Month</p>
                      <p className="font-semibold text-lg">{formData.visitMonth || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-semibold text-lg">{formData.startDate || 'Flexible'}</p>
                    </div>
                  </div>

                  {formData.interests.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.interests.map(interest => (
                          <span key={interest} className="px-3 py-1 bg-emerald-600 text-white rounded-full text-sm">
                            {interest.charAt(0).toUpperCase() + interest.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-emerald-50 p-6 rounded-lg border-l-4 border-emerald-600">
                  <h3 className="font-semibold text-gray-800 mb-2">Generated AI Prompt:</h3>
                  <p className="text-gray-700 italic">{generatePrompt()}</p>
                </div>

                <button
                  onClick={generateItinerary}
                  disabled={isGenerating || !formData.destination || !formData.duration || !formData.visitMonth}
                  className={`w-full py-4 rounded-lg font-semibold text-white text-lg flex items-center justify-center gap-2 transition-all transform  ${
                    isGenerating || !formData.destination || !formData.duration || !formData.visitMonth
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader className="animate-spin" size={24} />
                      Generating Your Perfect Itinerary...
                    </>
                  ) : (
                    <>
                      <FileText size={24} />
                      Generate Detailed Itinerary
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

                <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => animateStepTransition('prev')}
              disabled={currentStep === 1 || isAnimating}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all transform  ${
                currentStep === 1 || isAnimating
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700 shadow-md'
              }`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            {currentStep < 3 && (
              <button
                onClick={() => animateStepTransition('next')}
                disabled={
                  (currentStep === 1 && (!formData.destination || !formData.duration || !formData.visitMonth)) || isAnimating
                }
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all transform  ${
                  (currentStep === 1 && (!formData.destination || !formData.duration || !formData.visitMonth)) || isAnimating
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                }`}
              >
                Next
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
      </div>


  );
};

export default TourismItineraryMaker;