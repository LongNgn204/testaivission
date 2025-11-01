import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Clock, Star, Filter, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Hospital {
  id: string;
  name: string;
  nameEn: string;
  address: string;
  addressEn: string;
  phone: string;
  rating: number;
  reviewCount: number;
  distance: number; // km
  lat: number;
  lng: number;
  specialties: string[];
  specialtiesEn: string[];
  emergencyService: boolean;
  insuranceAccepted: string[];
  openingHours: string;
  website?: string;
  googleMapsUrl: string;
}

// 🏥 DATABASE: Top Eye Hospitals in Vietnam (expandable)
const HOSPITALS_DATABASE: Hospital[] = [
  {
    id: 'bv-mat-tw',
    name: 'Bệnh viện Mắt Trung ương',
    nameEn: 'Vietnam National Eye Hospital',
    address: '85 Bà Triệu, Hoàn Kiếm, Hà Nội',
    addressEn: '85 Ba Trieu St, Hoan Kiem, Hanoi',
    phone: '024 3822 3542',
    rating: 4.5,
    reviewCount: 1250,
    distance: 0,
    lat: 21.0227,
    lng: 105.8544,
    specialties: ['Phẫu thuật Lasik', 'Đục thủy tinh thể', 'Tật khúc xạ', 'Bệnh võng mạc', 'Glôcôm'],
    specialtiesEn: ['Lasik Surgery', 'Cataract', 'Refractive Error', 'Retinal Disease', 'Glaucoma'],
    emergencyService: true,
    insuranceAccepted: ['BHYT', 'Bảo Minh', 'Bảo Việt', 'Prudential'],
    openingHours: '7:00 - 17:00 (Thứ 2 - Thứ 7)',
    website: 'http://benhvienmattrunguong.gov.vn',
    googleMapsUrl: 'https://maps.google.com/?q=21.0227,105.8544',
  },
  {
    id: 'bv-mat-tphcm',
    name: 'Bệnh viện Mắt TP.HCM',
    nameEn: 'Ho Chi Minh City Eye Hospital',
    address: '280 Điện Biên Phủ, Quận 3, TP.HCM',
    addressEn: '280 Dien Bien Phu, District 3, HCMC',
    phone: '028 3829 4411',
    rating: 4.6,
    reviewCount: 2100,
    distance: 0,
    lat: 10.7769,
    lng: 106.6938,
    specialties: ['Phẫu thuật Lasik', 'Đục thủy tinh thể', 'Bệnh võng mạc', 'Mắt trẻ em', 'Glôcôm'],
    specialtiesEn: ['Lasik Surgery', 'Cataract', 'Retinal Disease', 'Pediatric Ophthalmology', 'Glaucoma'],
    emergencyService: true,
    insuranceAccepted: ['BHYT', 'Bảo Minh', 'Bảo Việt', 'AIA', 'Manulife'],
    openingHours: '7:00 - 17:00 (Thứ 2 - Thứ 7)',
    website: 'http://bvmat.org.vn',
    googleMapsUrl: 'https://maps.google.com/?q=10.7769,106.6938',
  },
  {
    id: 'japan-ivs',
    name: 'Hệ thống Nhãn khoa Nhật Bản (Japan IVS)',
    nameEn: 'Japan International Vision Support',
    address: '79 Trần Quốc Thảo, Quận 3, TP.HCM',
    addressEn: '79 Tran Quoc Thao, District 3, HCMC',
    phone: '028 3930 6655',
    rating: 4.8,
    reviewCount: 890,
    distance: 0,
    lat: 10.7806,
    lng: 106.6886,
    specialties: ['Phẫu thuật Lasik', 'ICL', 'Tật khúc xạ', 'Đục thủy tinh thể', 'Khám tổng quát'],
    specialtiesEn: ['Lasik Surgery', 'ICL', 'Refractive Error', 'Cataract', 'General Checkup'],
    emergencyService: false,
    insuranceAccepted: ['Bảo Minh', 'Bảo Việt', 'Prudential', 'AIA'],
    openingHours: '8:00 - 20:00 (Thứ 2 - CN)',
    website: 'https://www.japan-ivs.vn',
    googleMapsUrl: 'https://maps.google.com/?q=10.7806,106.6886',
  },
  {
    id: 'kangnam',
    name: 'Bệnh viện Mắt Quốc tế Kangnam',
    nameEn: 'Kangnam International Eye Hospital',
    address: '122 Nguyễn Văn Trỗi, Phú Nhuận, TP.HCM',
    addressEn: '122 Nguyen Van Troi, Phu Nhuan, HCMC',
    phone: '028 3844 9333',
    rating: 4.7,
    reviewCount: 1560,
    distance: 0,
    lat: 10.7987,
    lng: 106.6770,
    specialties: ['Phẫu thuật Lasik', 'Smile Pro', 'Đục thủy tinh thể', 'Bệnh võng mạc', 'Mắt trẻ em'],
    specialtiesEn: ['Lasik Surgery', 'Smile Pro', 'Cataract', 'Retinal Disease', 'Pediatric Ophthalmology'],
    emergencyService: true,
    insuranceAccepted: ['BHYT', 'Bảo Minh', 'Bảo Việt', 'Prudential', 'AIA', 'Manulife'],
    openingHours: '7:30 - 17:30 (Thứ 2 - Thứ 7)',
    website: 'https://kangnam.com.vn',
    googleMapsUrl: 'https://maps.google.com/?q=10.7987,106.6770',
  },
  {
    id: 'saigon-eye',
    name: 'Trung tâm Mắt Sài Gòn',
    nameEn: 'Saigon Eye Center',
    address: '143 Hai Bà Trưng, Quận 1, TP.HCM',
    addressEn: '143 Hai Ba Trung, District 1, HCMC',
    phone: '028 3829 8866',
    rating: 4.4,
    reviewCount: 780,
    distance: 0,
    lat: 10.7727,
    lng: 106.7007,
    specialties: ['Phẫu thuật Lasik', 'Tật khúc xạ', 'Khám tổng quát', 'Đục thủy tinh thể'],
    specialtiesEn: ['Lasik Surgery', 'Refractive Error', 'General Checkup', 'Cataract'],
    emergencyService: false,
    insuranceAccepted: ['Bảo Minh', 'Bảo Việt', 'AIA'],
    openingHours: '8:00 - 18:00 (Thứ 2 - Thứ 7)',
    website: 'https://saigoneyecenter.com',
    googleMapsUrl: 'https://maps.google.com/?q=10.7727,106.7007',
  },
];

export default function HospitalLocator() {
  const { t, language } = useLanguage();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>(HOSPITALS_DATABASE);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>(HOSPITALS_DATABASE);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // 📍 Get user's current location
  const getUserLocation = () => {
    setIsLoadingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPos);
          calculateDistances(userPos);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Location error:', error);
          // Default to Hanoi center if location denied
          const defaultPos = { lat: 21.0285, lng: 105.8542 };
          setUserLocation(defaultPos);
          calculateDistances(defaultPos);
          setIsLoadingLocation(false);
        }
      );
    } else {
      setIsLoadingLocation(false);
    }
  };

  // 📏 Calculate distances from user to all hospitals
  const calculateDistances = (userPos: { lat: number; lng: number }) => {
    const updatedHospitals = HOSPITALS_DATABASE.map((hospital) => ({
      ...hospital,
      distance: getDistance(userPos.lat, userPos.lng, hospital.lat, hospital.lng),
    }));
    setHospitals(updatedHospitals);
    setFilteredHospitals(updatedHospitals);
  };

  // 🧮 Haversine formula for distance calculation
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
  };

  // 🔍 Filter hospitals based on criteria
  useEffect(() => {
    let filtered = [...hospitals];

    // Filter by specialty
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter((h) =>
        language === 'vi'
          ? h.specialties.some((s) => s.includes(selectedSpecialty))
          : h.specialtiesEn.some((s) => s.toLowerCase().includes(selectedSpecialty.toLowerCase()))
      );
    }

    // Filter emergency only
    if (emergencyOnly) {
      filtered = filtered.filter((h) => h.emergencyService);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'distance') return a.distance - b.distance;
      return b.rating - a.rating;
    });

    setFilteredHospitals(filtered);
  }, [selectedSpecialty, emergencyOnly, sortBy, hospitals, language]);

  useEffect(() => {
    getUserLocation();
  }, []);

  const specialties =
    language === 'vi'
      ? ['Tất cả', 'Phẫu thuật Lasik', 'Đục thủy tinh thể', 'Bệnh võng mạc', 'Mắt trẻ em', 'Glôcôm']
      : ['All', 'Lasik', 'Cataract', 'Retinal', 'Pediatric', 'Glaucoma'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-3">
            <MapPin className="w-10 h-10 text-blue-600" />
            {language === 'vi' ? 'Tìm Bệnh Viện Mắt' : 'Find Eye Hospitals'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {language === 'vi'
              ? 'Khám phá các bệnh viện & phòng khám mắt uy tín gần bạn'
              : 'Discover trusted eye hospitals and clinics near you'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {language === 'vi' ? 'Bộ lọc' : 'Filters'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Specialty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'vi' ? 'Chuyên khoa' : 'Specialty'}
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {specialties.map((specialty, idx) => (
                  <option key={idx} value={idx === 0 ? 'all' : specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Emergency Filter */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emergencyOnly}
                  onChange={(e) => setEmergencyOnly(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'vi' ? 'Chỉ cấp cứu 24/7' : 'Emergency 24/7 only'}
                </span>
              </label>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'vi' ? 'Sắp xếp theo' : 'Sort by'}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="distance">{language === 'vi' ? 'Khoảng cách' : 'Distance'}</option>
                <option value="rating">{language === 'vi' ? 'Đánh giá' : 'Rating'}</option>
              </select>
            </div>
          </div>

          {/* Location Status */}
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Navigation className="w-4 h-4" />
            {isLoadingLocation ? (
              <span>{language === 'vi' ? 'Đang lấy vị trí...' : 'Getting location...'}</span>
            ) : userLocation ? (
              <span>
                {language === 'vi' ? 'Vị trí hiện tại: ' : 'Current location: '}
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </span>
            ) : (
              <button
                onClick={getUserLocation}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {language === 'vi' ? 'Bật định vị' : 'Enable location'}
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-700 dark:text-gray-300">
          {language === 'vi'
            ? `Tìm thấy ${filteredHospitals.length} bệnh viện`
            : `Found ${filteredHospitals.length} hospitals`}
        </div>

        {/* Hospital List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                    {language === 'vi' ? hospital.name : hospital.nameEn}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{hospital.rating}</span>
                    <span>({hospital.reviewCount} reviews)</span>
                  </div>
                </div>
                {hospital.distance > 0 && (
                  <div className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                    <span className="text-blue-700 dark:text-blue-300 font-semibold text-sm">
                      {hospital.distance} km
                    </span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="flex gap-2 mb-3 text-gray-700 dark:text-gray-300">
                <MapPin className="w-5 h-5 flex-shrink-0 text-gray-500" />
                <span className="text-sm">
                  {language === 'vi' ? hospital.address : hospital.addressEn}
                </span>
              </div>

              {/* Phone */}
              <div className="flex gap-2 mb-3 text-gray-700 dark:text-gray-300">
                <Phone className="w-5 h-5 flex-shrink-0 text-gray-500" />
                <a href={`tel:${hospital.phone}`} className="text-sm hover:text-blue-600">
                  {hospital.phone}
                </a>
              </div>

              {/* Opening Hours */}
              <div className="flex gap-2 mb-4 text-gray-700 dark:text-gray-300">
                <Clock className="w-5 h-5 flex-shrink-0 text-gray-500" />
                <span className="text-sm">{hospital.openingHours}</span>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  {language === 'vi' ? 'CHUYÊN KHOA:' : 'SPECIALTIES:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(language === 'vi' ? hospital.specialties : hospital.specialtiesEn)
                    .slice(0, 3)
                    .map((specialty, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  {hospital.specialties.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                      +{hospital.specialties.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {hospital.emergencyService && (
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-semibold rounded-full">
                    {language === 'vi' ? '🚨 Cấp cứu 24/7' : '🚨 Emergency 24/7'}
                  </span>
                )}
                {hospital.insuranceAccepted.includes('BHYT') && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                    {language === 'vi' ? '✓ BHYT' : '✓ Insurance'}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <a
                  href={hospital.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  {language === 'vi' ? 'Chỉ đường' : 'Directions'}
                </a>
                {hospital.website && (
                  <a
                    href={hospital.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredHospitals.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {language === 'vi'
                ? 'Không tìm thấy bệnh viện phù hợp. Hãy thử bỏ bớt bộ lọc.'
                : 'No hospitals found. Try removing some filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
