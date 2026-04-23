import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getDetailCommon, getDetailIntro, getDetailInfo, getDetailImage } from '../api/travelInfoApi';
import '../App.css';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

const CONTENT_TYPE = {
  12: '관광지', 14: '문화시설', 15: '축제공연행사',
  25: '여행코스', 28: '레포츠', 32: '숙박', 38: '쇼핑', 39: '음식점',
};

const INTRO_FIELD_MAP = {
  infocenter: { label: '문의 및 안내', icon: 'info' },
  usetime: { label: '개방시간', icon: 'schedule' },
  restdate: { label: '휴무일', icon: 'event_busy' },
  parking: { label: '주차장', icon: 'local_parking' },
  usefee: { label: '입장료', icon: 'payments' },
  homepage: { label: '홈페이지', icon: 'language' },
};

const TravelDetail = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [loading, setLoading] = useState(true);
  const [common, setCommon] = useState(null);
  const [intro, setIntro] = useState(null);
  const [infoItems, setInfoItems] = useState([]);
  const [images, setImages] = useState([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 1. 카카오 맵 스크립트 안정 로딩 (핵심 수정)
  useEffect(() => {
    const appKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
    const scriptId = 'kakao-map-script';

    const initializeMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setIsMapLoaded(true);
        });
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services,clusterer,drawing&autoload=false`;
      script.async = true;
      document.head.appendChild(script);
      script.onload = initializeMap;
    } else {
      initializeMap();
    }
  }, []);

  // 2. 상세 데이터 페칭
  useEffect(() => {
    const fetchAll = async () => {
      if (!contentId) return;
      try {
        setLoading(true);
        const commonData = await getDetailCommon(contentId);
        if (!commonData) {
          setLoading(false);
          return;
        }
        setCommon(commonData);

        const cTypeId = commonData.contenttypeid;
        const [introData, infoData, imageData] = await Promise.all([
          getDetailIntro(contentId, cTypeId),
          getDetailInfo(contentId, cTypeId),
          getDetailImage(contentId),
        ]);

        setIntro(introData);
        setInfoItems(infoData?.items ?? []);
        setImages(imageData?.items ?? []);
      } catch (err) {
        console.error('Fetch detail error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [contentId]);

  const systemEnvFields = () => {
    const fields = [];
    const push = (icon, label, value) => {
      if (value && String(value).trim() && value !== 'null') {
        fields.push({ icon, label, value: String(value) });
      }
    };
    if (common?.tel) push('call', '전화번호', common.tel);
    if (common?.addr1) push('location_on', '주소', `${common.addr1} ${common.addr2 || ''}`);
    if (intro) {
      Object.entries(intro).forEach(([key, value]) => {
        const meta = INTRO_FIELD_MAP[key];
        if (meta && value) push(meta.icon, meta.label, value);
      });
    }
    return fields;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-xs font-mono text-outline animate-pulse">// fetching_destination_node...</p>
      </div>
    );
  }

  if (!common) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-on-secondary-container">
        <span className="material-symbols-outlined text-5xl mb-4 opacity-30">search_off</span>
        <p className="font-label text-sm syntax-comment">// destination_not_found</p>
        <button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-label">BACK_TO_LIST</button>
      </div>
    );
  }

  const heroImage = state?.firstimage || common.firstimage || (images.length > 0 ? (images[0].originimgurl || images[0].firstimage) : null);
  const envFields = systemEnvFields();

  return (
    <div className="bg-background text-on-surface font-body min-h-screen pb-20">
      <section className="relative h-[400px] w-full bg-slate-900 overflow-hidden">
        {heroImage ? (
          <img alt={common.title} className="w-full h-full object-cover opacity-80" src={heroImage} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800">
            <span className="material-symbols-outlined text-8xl text-slate-700">image_not_supported</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-10 left-10">
          <span className="bg-primary/20 backdrop-blur-md text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/20 mb-4 inline-block">
            {CONTENT_TYPE[common.contenttypeid] || '기타'}
          </span>
          <h1 className="text-5xl font-headline font-extrabold text-white tracking-tighter drop-shadow-2xl">
            {common.title}
          </h1>
        </div>
      </section>

      <div className="px-8 lg:px-12 py-10 grid grid-cols-12 gap-8 max-w-[1600px] mx-auto">
        <div className="col-span-12 lg:col-span-8 space-y-10">
          <div className="bg-white p-8 rounded-2xl border border-outline-variant/10 shadow-sm font-mono text-sm leading-relaxed">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <p className="text-primary font-bold uppercase tracking-tighter">node_description.log</p>
            </div>
            {common.overview ? (
              <div className="text-slate-600 leading-loose" dangerouslySetInnerHTML={{ __html: common.overview }} />
            ) : (
              <p className="text-slate-400 italic">// No description available.</p>
            )}
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {images.map((img, i) => (
                <img key={i} src={img.originimgurl || img.firstimage || img.smallimageurl} className="rounded-xl h-48 w-full object-cover border border-outline-variant/10 shadow-sm" alt="gallery" />
              ))}
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm space-y-6">
            <h3 className="font-headline font-bold flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary">terminal</span>
              system.env
            </h3>
            <div className="space-y-4">
              {envFields.map((field, i) => (
                <div key={i} className="flex gap-3">
                  <span className="material-symbols-outlined text-slate-300 text-lg">{field.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{field.label}</p>
                    <p className="text-sm text-on-surface font-medium">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate(-1)} className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all border border-slate-200">
              RETURN_TO_LIST
            </button>
          </div>

          {/* Map Area */}
          {common.mapx && common.mapy && (
            <div className="rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm h-[300px] relative bg-slate-100">
              {!isMapLoaded ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  <p className="text-[10px] text-outline font-mono animate-pulse">Initializing Map SDK...</p>
                </div>
              ) : (
                <Map
                  center={{ lat: Number(common.mapy), lng: Number(common.mapx) }}
                  style={{ width: '100%', height: '100%' }}
                  level={3}
                >
                  <MapMarker position={{ lat: Number(common.mapy), lng: Number(common.mapx) }} />
                </Map>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelDetail;
