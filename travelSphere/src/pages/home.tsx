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

const SAMPLE_REQUEST_FOR_REPORT = `
curl -X 'POST' \
  'http://localhost:8000/travel/plan' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "accommodation_type": "hotel",
  "budget_range": "moderate",
  "destination": "Pokhara, Nepal",
  "difficulty_level": "moderate",
  "duration": 5,
  "group_size": 2,
  "interests": "temples, hiking, lakes, food",
  "notes": "Prefer mountain views",
  "start_date": "2025-12-15"
}'
`


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
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportResponse, setReportResponse] = useState<any | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
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

  // Change background image according to current form step (simple preload & set)
  useEffect(() => {
    const newIndex = (currentStep - 1) % BG_IMAGES.length;
    let mounted = true;
    const img = new Image();
    img.src = BG_IMAGES[newIndex];
    img.onload = () => { if (!mounted) return; setBgIndex(newIndex); };
    const fallback = setTimeout(() => { if (!mounted) return; setBgIndex(newIndex); }, 3000);
    return () => { mounted = false; img.onload = null; clearTimeout(fallback); };
  }, [currentStep]);

  // Function to send report request to the backend
  const sendReport = async () => {
    const REPORT_ENDPOINT = 'http://localhost:8000/travel/plan';

    setReportLoading(true);
    setReportError(null);

    const body = {
      // Only the required fields as requested
      accommodation_type: formData.accommodation || 'hotel',
      budget_range: formData.budget || 'moderate',
      destination: formData.destination || '',
      difficulty_level: formData.difficulty || 'moderate',
      duration: Number(formData.duration ?? 1),
      group_size: Number(formData.groupSize ?? 1),
      interests: Array.isArray(formData.interests)
        ? formData.interests.join(',')
        : '',
      notes: 'Prefer mountain views',
      start_date: formData.startDate || null
    };

    try {
      const res = await fetch(REPORT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const data = await res.json();
      setReportResponse(data);
      setItinerary(data.itinerary ?? data);
      setShowReport(true);

      // extract smallest geo points (objects with latitude & longitude)
      const points: Array<any> = [];
      const extractGeo = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        if ('latitude' in obj && 'longitude' in obj) {
          const p: any = { latitude: obj.latitude, longitude: obj.longitude };
          if (obj.name) p.name = obj.name;
          points.push(p);
          return;
        }
        for (const k of Object.keys(obj)) extractGeo(obj[k]);
      };
      extractGeo(data.itinerary ?? data);

      try {
        localStorage.setItem('geo_points', JSON.stringify(points));
      } catch (e) {
        // ignore storage errors
        console.warn('Failed to store geo points in localStorage', e);
      }
    } catch (err: any) {
      console.error('Report request failed', err);
      setReportError(err?.message || 'Request failed');
    } finally {
      setReportLoading(false);
      setIsGenerating(false);
    }
  };

  // Simple markdown -> HTML conversion for showing markdown_description
  const markdownToHtml = (md: string | null): string => {
    if (!md) return '';
    // escape HTML to avoid injecting raw HTML from markdown content
    const escapeHtml = (s: string) =>
      s.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#39;');

    // process inline markdown (bold, italic) on already-escaped text
    const processInline = (s: string) => {
      // bold first
      s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // then italic — avoid matching list prefixes because lists are handled separately
      s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
      return s;
    };

    const lines = md.split(/\r?\n/);
    const htmlLines: string[] = [];
    let inList = false;

    for (let rawLine of lines) {
      const trimmed = rawLine.trim();

      if (/^###\s+/.test(trimmed)) {
        const content = escapeHtml(trimmed.replace(/^###\s+/, ''));
        htmlLines.push(`<h3>${processInline(content)}</h3>`);
      } else if (/^##\s+/.test(trimmed)) {
        const content = escapeHtml(trimmed.replace(/^##\s+/, ''));
        htmlLines.push(`<h2>${processInline(content)}</h2>`);
      } else if (/^#\s+/.test(trimmed)) {
        const content = escapeHtml(trimmed.replace(/^#\s+/, ''));
        htmlLines.push(`<h1>${processInline(content)}</h1>`);
      } else if (/^[-*]\s+/.test(trimmed)) {
        if (!inList) {
          htmlLines.push('<ul>');
          inList = true;
        }
        const content = escapeHtml(trimmed.replace(/^[-*]\s+/, ''));
        htmlLines.push(`<li>${processInline(content)}</li>`);
      } else {
        if (inList) {
          htmlLines.push('</ul>');
          inList = false;
        }
        if (trimmed === '') {
          htmlLines.push('<br/>');
        } else {
          const content = escapeHtml(trimmed);
          htmlLines.push(`<p>${processInline(content)}</p>`);
        }
      }
    }

    if (inList) htmlLines.push('</ul>');
    return htmlLines.join('');
  };

  const animateStepTransition = (direction: 'next' | 'prev') => {
    if (!contentRef.current || isAnimating) return;
    setIsAnimating(true);
    const content = contentRef.current;

    if (typeof window.gsap !== 'undefined') {
      const gsap = window.gsap;

      if (direction === 'next') {
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


  const generateItinerary = () => {
    setIsGenerating(true);
    sendReport();
  };
    


  const handlePrint = () => {
    window.print();
  };

  // Show report view when we have response
  if (showReport) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="no-print mb-6 flex justify-between items-center">
            <button
              onClick={() => {
                setShowReport(false);
                setReportResponse(null);
                setReportError(null);
              }}
              className="flex items-center bg-black gap-2 px-4 py-2 text-white rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
              Back to Form
            </button>

            <button
              onClick={handlePrint}
              disabled={reportLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                reportLoading
                  ? 'bg-gray-400 text-white opacity-60 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {reportLoading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Generating report...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Print Report
                </>
              )}
            </button>
          </div>

          <div ref={printRef} className="p-8 print:shadow-none">
            {reportLoading && (
              <div className="flex items-center gap-3 text-gray-700">
                <Loader className="animate-spin" size={32} />
                <div>
                  <div className="font-semibold text-xl">Generating your report</div>
                  <div className="text-sm text-gray-500">
                    This may take a few seconds — the report will display automatically when ready.
                  </div>
                </div>
              </div>
            )}

            {!reportLoading && reportResponse && (
              <div>
                <div className="text-center mb-8 border-b pb-6">
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    {reportResponse.itinerary?.destination || 'Travel'} Itinerary
                  </h1>
                  <p className="text-xl text-gray-600">
                    {reportResponse.itinerary?.total_days || 0} Days Journey
                  </p>
                  <p className="text-gray-500 mt-2">
                    {reportResponse.itinerary?.travel_type || ''}
                  </p>
                </div>

                <div
                  className="prose prose-emerald max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: markdownToHtml(reportResponse.itinerary?.markdown_description)
                  }}
                />

                <div className="text-center text-sm text-gray-500 border-t pt-6 mt-8">
                  <p>
                    Generated on{' '}
                    {new Date(
                      reportResponse.itinerary?.created_at || Date.now()
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {!reportLoading && reportError && (
              <div className="text-red-600 text-center">
                <p className="font-semibold text-lg mb-2">Failed to generate report</p>
                <p>{reportError}</p>
              </div>
            )}
          </div>

          <style>{`
            @media print {
              .no-print {
                display: none !important;
              }
              body {
                margin: 0;
              }
            }
          `}</style>
        </div>
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