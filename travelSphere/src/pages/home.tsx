import React, { useState, useRef } from 'react';
import { MapPin, Calendar, Clock, DollarSign, Mountain, Users, Hotel, Plane, Bus, Utensils, Camera, FileText, Download, ChevronRight, ChevronLeft, CheckCircle, Loader } from 'lucide-react';

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

// Location details for some notable places
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
    location: 'Mustang is a remote, high-altitude district in northern Nepal, bordering Tibet. It includes the Upper Mustang region (formerly a restricted kingdom).',
    highlights: [
      'Dramatic arid landscapes and canyon-like valleys',
      'Traditional Tibetan-influenced culture and architecture',
      'Gateway to Muktinath and key trekking routes (Annapurna Circuit segments)'
    ],
    notes: 'Upper Mustang requires a permit for visitors; best visited in spring and autumn. Altitudes vary widely; be prepared for cold and high-altitude conditions.'
  },
  nepal: {
    title: 'Nepal',
    location: 'Nepal is a Himalayan country in South Asia, home to diverse landscapes from subtropical plains to the world’s highest mountains.',
    highlights: [
      'Home to eight of the world’s ten highest peaks, including Mount Everest',
      'Rich cultural and religious heritage (Hinduism and Buddhism)',
      'Popular trekking regions: Annapurna, Everest, Langtang, Manaslu'
    ],
    travelTips: 'Acclimatize when traveling to high-altitude regions, carry appropriate permits for restricted areas, and check seasonal weather patterns before planning travel.'
  }
}

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
  const printRef = useRef<HTMLDivElement | null>(null);

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
    
    // Try to attach location-specific details if we have them
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
      }
      ,
      locationDetails: locationDetails
    };
    
    setItinerary(generatedItinerary);
    setIsGenerating(false);
    setShowReport(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const ProgressIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map(step => (
        <React.Fragment key={step}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {currentStep > step ? <CheckCircle size={20} /> : step}
          </div>
          {step < 3 && (
            <div className={`w-24 h-1 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  if (showReport && itinerary) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-6">
          <div className="no-print mb-6 flex justify-between items-center">
            <button
              onClick={() => setShowReport(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <ChevronLeft size={20} />
              Back to Form
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download size={20} />
              Print Report
            </button>
          </div>

          <div ref={printRef} className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
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
                {itinerary.locationDetails.religiousSignificance && (
                  <div className="mb-2">
                    <p className="font-semibold">Religious Significance</p>
                    <div className="text-sm text-gray-700">
                      {itinerary.locationDetails.religiousSignificance.hindu && (
                        <div className="mb-1">
                          <p className="font-medium">Hindu:</p>
                          <p>{itinerary.locationDetails.religiousSignificance.hindu.name} — {itinerary.locationDetails.religiousSignificance.hindu.deity}</p>
                          <ul className="list-disc list-inside mt-1">
                            {itinerary.locationDetails.religiousSignificance.hindu.notes.map((n: string, i: number) => (
                              <li key={i}>{n}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {itinerary.locationDetails.religiousSignificance.buddhist && (
                        <div>
                          <p className="font-medium">Buddhist:</p>
                          <p>{itinerary.locationDetails.religiousSignificance.buddhist.name} — {itinerary.locationDetails.religiousSignificance.buddhist.worship}</p>
                          <ul className="list-disc list-inside mt-1">
                            {itinerary.locationDetails.religiousSignificance.buddhist.notes.map((n: string, i: number) => (
                              <li key={i}>{n}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {itinerary.locationDetails.keyFeatures && (
                  <div className="mb-2">
                    <p className="font-semibold">Key Features</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                      {itinerary.locationDetails.keyFeatures.map((f: string, i: number) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {itinerary.locationDetails.howToReach && (
                  <div className="mb-2">
                    <p className="font-semibold">How to Reach</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                      {itinerary.locationDetails.howToReach.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {itinerary.locationDetails.bestTimeToVisit && (
                  <p className="text-sm text-gray-700"><strong>Best Time to Visit:</strong> {itinerary.locationDetails.bestTimeToVisit}</p>
                )}
                {itinerary.locationDetails.avoidSeasons && (
                  <p className="text-sm text-gray-700 mt-1"><strong>Seasons to Avoid:</strong> {itinerary.locationDetails.avoidSeasons}</p>
                )}
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="text-blue-600" />
                Trip Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-lg font-semibold">{itinerary.duration} Days</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-lg font-semibold">{itinerary.overview.totalDistance}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="text-lg font-semibold capitalize">{itinerary.overview.difficulty}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="text-lg font-semibold capitalize">{itinerary.overview.budget}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plane className="text-blue-600" />
                Transportation Options
              </h2>
              <div className="space-y-3">
                {itinerary.transportation.toDestination.map((transport: { type: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; from: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; to: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; price: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; duration: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, idx: React.Key | null | undefined) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-4">
                      {transport.type === 'flight' ? <Plane size={24} /> : <Bus size={24} />}
                      <div>
                        <p className="font-semibold capitalize">{transport.type}</p>
                        <p className="text-sm text-gray-600">{transport.from} → {transport.to}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{transport.price}</p>
                      <p className="text-sm text-gray-600">{transport.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Hotel className="text-blue-600" />
                Recommended Accommodation
              </h2>
              <div className="space-y-3">
                {itinerary.accommodation.map((hotel: { name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; type: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; location: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; price: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; rating: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, idx: React.Key | null | undefined) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-lg">{hotel.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{hotel.type} • {hotel.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">{hotel.price}</p>
                        <p className="text-sm text-yellow-600">★ {hotel.rating}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="text-blue-600" />
                Day-by-Day Itinerary
              </h2>
              {itinerary.dailyPlan.map((day: { day: boolean | React.Key | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; title: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; schedule: any[]; highlights: any[]; distance: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; overnight: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
                <div key={`day-${day.day}`} className="mb-6 border-l-4 border-blue-600 pl-6 break-inside-avoid">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Day {day.day}: {day.title}</h3>
                  
                  <div className="space-y-2 mb-4">
                    {day.schedule.map((item: { time: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; activity: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; location: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; duration: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; description: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; cost: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, idx: React.Key | null | undefined) => (
                      <div key={idx} className="flex gap-4 bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-2 min-w-fit">
                          <Clock size={16} className="text-blue-600" />
                          <span className="font-semibold text-sm">{item.time}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{item.activity}</p>
                          <p className="text-sm text-gray-600">{item.location} • {item.duration}</p>
                          {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                          {item.cost && <p className="text-sm text-green-600 mt-1">Cost: {item.cost}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg mb-3">
                    <p className="font-semibold mb-2">Highlights:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {day.highlights.map((highlight: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, idx: React.Key | null | undefined) => (
                        <li key={idx} className="text-sm text-gray-700">{highlight}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-4 text-sm">
                    <p><strong>Distance:</strong> {day.distance}</p>
                    <p><strong>Overnight:</strong> {day.overnight}</p>
                    <p><strong>Meals:</strong> B/L/D included</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Camera className="text-blue-600" />
                Important Places to Visit
              </h2>
              {itinerary.importantPlaces.map((place: { name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; type: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; significance: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; history: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; visitDuration: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; entryFee: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; tips: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, idx: React.Key | null | undefined) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-lg mb-4 break-inside-avoid">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{place.name}</h3>
                  <p className="text-sm text-blue-600 mb-3">{place.type} • {place.significance}</p>
                  <p className="text-gray-700 mb-3">{place.history}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Visit Duration</p>
                      <p className="font-semibold">{place.visitDuration}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Entry Fee</p>
                      <p className="font-semibold">{place.entryFee}</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-yellow-50 p-3 rounded">
                    <p className="text-sm"><strong>Tips:</strong> {place.tips}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8 break-inside-avoid">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="text-blue-600" />
                Route Map
              </h2>
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">Coordinates: {itinerary.map.coordinates}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
                  {itinerary.map.route[0].split(' → ').map((location: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, idx: React.Key | null | undefined, arr: string | any[]) => (
                    <React.Fragment key={idx}>
                      <div className="bg-white px-4 py-2 rounded-full shadow">
                        {location}
                      </div>
                      {(idx as number) < arr.length - 1 && <ChevronRight className="text-gray-400" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="text-blue-600" />
                Travel Essentials
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-bold mb-3">Packing List</h3>
                  <ul className="space-y-2">
                    {itinerary.essentials.packing.map((item: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, idx: React.Key | null | undefined) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-1" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-bold mb-3">Important Documents</h3>
                  <ul className="space-y-2">
                    {itinerary.essentials.documents.map((item: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, idx: React.Key | null | undefined) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-1" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-8 break-inside-avoid">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="text-blue-600" />
                Budget Breakdown
              </h2>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Accommodation</span>
                    <span className="font-semibold">{itinerary.essentials.budget.accommodation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Food & Drinks</span>
                    <span className="font-semibold">{itinerary.essentials.budget.food}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transportation</span>
                    <span className="font-semibold">{itinerary.essentials.budget.transportation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Activities & Entry Fees</span>
                    <span className="font-semibold">{itinerary.essentials.budget.activities}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-lg">
                    <span className="font-bold">Total Estimated Cost</span>
                    <span className="font-bold text-blue-600">{itinerary.essentials.budget.total}</span>
                  </div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Tourism Itinerary Maker</h1>
          <p className="text-gray-600">Plan your perfect journey with AI-powered recommendations</p>
          <button
            onClick={() => window.location.href = '/ar-location-map'}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Map
          </button>
          
          
<button
            onClick={() => window.location.href = '/add-place'}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add place
          </button>
        </div>
      

        <ProgressIndicator />

        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Basic Trip Information</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Destination *
                </label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  placeholder="e.g., Pokhara, Kathmandu, Chitwan"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="e.g., 5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Visit Month *
                  </label>
                  <select
                    value={formData.visitMonth}
                    onChange={(e) => handleInputChange('visitMonth', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Month</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Preferences</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="budget">Budget ($-$$)</option>
                    <option value="moderate">Moderate ($$-$$$)</option>
                    <option value="luxury">Luxury ($$$-$$$$)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Interests (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['temples', 'trails', 'rivers', 'mountains', 'culture', 'wildlife', 'photography', 'adventure', 'relaxation'].map(interest => (
                    <button
                      key={interest}
                      onClick={() => handleArrayToggle('interests', interest)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        formData.interests.includes(interest)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {interest.charAt(0).toUpperCase() + interest.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Group Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.groupSize}
                    onChange={(e) => handleInputChange('groupSize', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Accommodation Type
                  </label>
                  <select
                    value={formData.accommodation}
                    onChange={(e) => handleInputChange('accommodation', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="guesthouse">Guesthouse</option>
                    <option value="resort">Resort</option>
                    <option value="hostel">Hostel</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Accessibility Requirements
                </label>
                <select
                  value={formData.accessibility}
                  onChange={(e) => handleInputChange('accessibility', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="wheelchair">Wheelchair Accessible</option>
                  <option value="elderly">Elderly Friendly</option>
                  <option value="family">Family with Kids</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Review Your Trip Details</h2>
              
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
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
                  <div>
                    <p className="text-sm text-gray-600">Difficulty</p>
                    <p className="font-semibold text-lg capitalize">{formData.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-semibold text-lg capitalize">{formData.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Group Size</p>
                    <p className="font-semibold text-lg">{formData.groupSize} people</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Accommodation</p>
                    <p className="font-semibold text-lg capitalize">{formData.accommodation}</p>
                  </div>
                </div>

                {formData.interests.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map(interest => (
                        <span key={interest} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {interest.charAt(0).toUpperCase() + interest.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
                <h3 className="font-semibold text-gray-800 mb-2">Generated AI Prompt:</h3>
                <p className="text-gray-700 italic">{generatePrompt()}</p>
              </div>

              <button
                onClick={generateItinerary}
                disabled={isGenerating || !formData.destination || !formData.duration || !formData.visitMonth}
                className={`w-full py-4 rounded-lg font-semibold text-white text-lg flex items-center justify-center gap-2 ${
                  isGenerating || !formData.destination || !formData.duration || !formData.visitMonth
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700'
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

          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
                currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            {currentStep < 3 && (
              <button
                onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                disabled={
                  currentStep === 1 && (!formData.destination || !formData.duration || !formData.visitMonth)
                }
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
                  currentStep === 1 && (!formData.destination || !formData.duration || !formData.visitMonth)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
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
  );
};

export default TourismItineraryMaker;