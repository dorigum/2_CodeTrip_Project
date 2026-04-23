import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getDetailCommon, getDetailIntro, getDetailInfo, getDetailImage } from '../api/travelInfoApi';
import '../App.css';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';

const CONTENT_TYPE = {
  12: '관광지', 14: '문화시설', 15: '축제공연행사',
  25: '여행코스', 28: '레포츠', 32: '숙박', 38: '쇼핑', 39: '음식점',
};

const INTRO_FIELD_MAP = {
  infocenter: { label: '문의 및 안내', icon: 'info' },
  infocenterculture: { label: '문의 및 안내', icon: 'info' },
  infocenterfood: { label: '문의 및 안내', icon: 'info' },
  infocentershopping: { label: '문의 및 안내', icon: 'info' },
  infocenterleports: { label: '문의 및 안내', icon: 'info' },
  infocenterlodging: { label: '문의 및 안내', icon: 'info' },

  usetime: { label: '개방시간', icon: 'schedule' },
  usetimeculture: { label: '개방시간', icon: 'schedule' },
  usetimeleports: { label: '개방시간', icon: 'schedule' },
  usetimeshopping: { label: '개방시간', icon: 'schedule' },
  opentimefood: { label: '개방시간', icon: 'schedule' },
  openperiod: { label: '개방 기간', icon: 'schedule' },
  checkintime: { label: '체크인', icon: 'schedule' },
  checkouttime: { label: '체크아웃', icon: 'schedule' },

  restdate: { label: '휴무일', icon: 'event_busy' },
  restdateculture: { label: '휴무일', icon: 'event_busy' },
  restdateleports: { label: '휴무일', icon: 'event_busy' },
  restdatefood: { label: '휴무일', icon: 'event_busy' },
  restdatelodging: { label: '휴무일', icon: 'event_busy' },
  restdateshopping: { label: '휴무일', icon: 'event_busy' },

  parking: { label: '주차장', icon: 'local_parking' },
  parkingculture: { label: '주차장', icon: 'local_parking' },
  parkingleports: { label: '주차장', icon: 'local_parking' },
  parkingfood: { label: '주차장', icon: 'local_parking' },
  parkinglodging: { label: '주차장', icon: 'local_parking' },
  parkingshopping: { label: '주차장', icon: 'local_parking' },
  parkingfee: { label: '주차 요금', icon: 'local_parking' },

  usefee: { label: '입장료', icon: 'payments' },
  usefeeleports: { label: '입장료', icon: 'payments' },
  discountinfo: { label: '할인 정보', icon: 'payments' },

  chkbabycarriage: { label: '유모차 대여', icon: 'child_friendly' },
  chkbabycarriageculture: { label: '유모차 대여', icon: 'child_friendly' },
  chkbabycarriageleports: { label: '유모차 대여', icon: 'child_friendly' },

  chkcreditcard: { label: '신용카드', icon: 'credit_card' },
  chkcreditcardculture: { label: '신용카드', icon: 'credit_card' },
  chkcreditcardleports: { label: '신용카드', icon: 'credit_card' },
  chkcreditcardshopping: { label: '신용카드', icon: 'credit_card' },
  chkcreditcardfood: { label: '신용카드', icon: 'credit_card' },

  chkpet: { label: '반려동물', icon: 'pets' },
  chkpetculture: { label: '반려동물', icon: 'pets' },
  chkpetleports: { label: '반려동물', icon: 'pets' },

  accomcount: { label: '수용 인원', icon: 'groups' },
  accomcountculture: { label: '수용 인원', icon: 'groups' },
  accomcountlodging: { label: '수용 인원', icon: 'groups' },
  accomcountleports: { label: '수용 인원', icon: 'groups' },

  scaleleports: { label: '규모', icon: 'straighten' },
  expguide: { label: '체험 안내', icon: 'hiking' },
  expagerange: { label: '체험 가능 연령', icon: 'people' },

  firstmenu: { label: '대표 메뉴', icon: 'restaurant_menu' },
  treatmenu: { label: '취급 메뉴', icon: 'restaurant_menu' },
  seat: { label: '좌석 수', icon: 'chair' },
  kidsfacility: { label: '어린이 시설', icon: 'child_care' },
  smoking: { label: '금연', icon: 'smoke_free' },

  reservationlodging: { label: '예약 안내', icon: 'book_online' },
};

const TravelDetail = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_API_KEY,
    libraries: ['clusterer', 'drawing', 'services'],
  });

  const [loading, setLoading] = useState(true);
  const [common, setCommon] = useState(null);
  const [intro, setIntro] = useState(null);
  const [infoItems, setInfoItems] = useState([]);
  const [images, setImages] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const commonData = await getDetailCommon(contentId);
      setCommon(commonData);

      const contentTypeId = commonData?.contenttypeid;
      const [introData, infoData, imageData] = await Promise.all([
        getDetailIntro(contentId, contentTypeId),
        getDetailInfo(contentId, contentTypeId),
        getDetailImage(contentId),
      ]);
      setIntro(Array.isArray(introData) ? introData[0] : introData);
      setInfoItems(infoData?.items ?? []);
      setImages(imageData?.items ?? []);
      setLoading(false);
    };
    fetchAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [contentId]);

  const systemEnvFields = () => {
    const fields = [];
    const seenLabels = new Set();

    const push = (icon, label, value, html = false) => {
      if (!value || seenLabels.has(label)) return;
      seenLabels.add(label);
      fields.push({ icon, label, value: String(value), html });
    };

    if (common?.tel) push('call', '전화번호', common.tel);
    if (common?.addr1) push('location_on', '주소', `${common.addr1}${common.addr2 ? ' ' + common.addr2 : ''}`);

    if (intro) {
      Object.entries(intro).forEach(([key, value]) => {
        const meta = INTRO_FIELD_MAP[key];
        if (meta && value && String(value).trim()) {
          push(meta.icon, meta.label, value);
        }
      });
    }

    infoItems.forEach((item) => {
      if (item.infoname && item.infotext && String(item.infotext).trim()) {
        push('list_alt', item.infoname, item.infotext, true);
      }
    });

    if (common?.homepage) push('language', '홈페이지', common.homepage, true);

    return fields;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!common) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-on-secondary-container">
        <span className="material-symbols-outlined text-5xl mb-4 opacity-30">search_off</span>
        <p className="font-label text-sm syntax-comment">// destination not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-label"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const heroImage = state?.firstimage || common.firstimage || images[0]?.originimgurl || null;
  const contentTypeLabel = CONTENT_TYPE[common.contenttypeid] ?? '기타';
  const envFields = systemEnvFields();

  return (
    <div className="bg-background text-on-surface font-body min-h-screen">
      {/* Hero */}
      <section className="relative h-[480px] w-full bg-surface-container-high overflow-hidden">
        {heroImage ? (
          <img alt={common.title} className="w-full h-full object-cover" src={heroImage} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container-low">
            <span className="material-symbols-outlined text-8xl text-outline opacity-20">image_not_supported</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute bottom-10 left-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary/10 text-primary px-3 py-1 text-xs font-label uppercase tracking-widest rounded-full border border-primary/20">
              {contentTypeLabel}
            </span>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-on-secondary-container hover:text-primary text-xs font-label transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              목록으로
            </button>
          </div>
          <h1 className="text-5xl lg:text-6xl font-headline font-extrabold text-on-background tracking-tighter mb-3">
            {common.title}
          </h1>
          {common.addr1 && (
            <p className="text-base text-on-surface-variant font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {common.addr1}{common.addr2 ? ` ${common.addr2}` : ''}
            </p>
          )}
        </div>
      </section>

      {/* Content Grid */}
      <div className="px-8 lg:px-12 py-12 grid grid-cols-12 gap-8 max-w-[1600px] mx-auto">

        {/* Left: Description + Info + Gallery */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-10">

          {/* DESTINATION_DESCRIPTION.md */}
          <div className="bg-surface-container-low p-1 rounded-lg shadow-[0_2px_12px_rgba(25,28,30,0.06)]">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-outline-variant/20 bg-surface-container-low rounded-t-[4px]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(186,26,26,0.6)' }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(90,95,101,0.6)' }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(0,184,212,0.6)' }} />
              </div>
              <span className="text-[10px] font-label text-outline uppercase tracking-widest">
                destination_description.md
              </span>
            </div>
            <div className="bg-surface-container-low rounded-b-[4px] p-8 font-mono text-sm leading-relaxed overflow-x-auto code-block-syntax">
              <p className="text-primary font-bold mb-4"># {common.title}</p>
              <p className="text-secondary italic mb-6">// {contentTypeLabel} · {common.addr1}</p>
              {common.overview ? (
                <div
                  className="text-on-surface-variant leading-loose [&_br]:block [&_br]:mb-2"
                  dangerouslySetInnerHTML={{ __html: common.overview }}
                />
              ) : (
                <p className="text-secondary italic">// 상세 설명이 없습니다.</p>
              )}
            </div>
          </div>

          {/* Gallery */}
          {images.length > 0 && (
            <div>
              <h3 className="font-headline font-bold text-lg mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">photo_library</span>
                갤러리
                <span className="text-xs font-label text-outline ml-1">({images.length})</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={`rounded-xl overflow-hidden ${i === 0 && images.length >= 3 ? 'col-span-2' : ''}`}
                  >
                    <img
                      alt={img.imgname || `image-${i + 1}`}
                      className="w-full object-cover hover:scale-105 transition-transform duration-500"
                      style={{ height: i === 0 && images.length >= 3 ? '24rem' : '16rem' }}
                      src={img.originimgurl || img.smallimageurl}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 className="font-headline font-bold text-lg mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">chat</span>
              코멘트
              <span className="text-xs font-label text-outline ml-1">(3)</span>
            </h3>

            {/* Comment Input */}
            <div className="bg-surface-container-low p-1 rounded-lg mb-6 shadow-[0_2px_12px_rgba(25,28,30,0.06)]">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-outline-variant/20 rounded-t-[4px]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(186,26,26,0.6)' }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(90,95,101,0.6)' }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(0,184,212,0.6)' }} />
                </div>
                <span className="text-[10px] font-label text-outline uppercase tracking-widest">new_comment.md</span>
              </div>
              <div className="p-5">
                <div className="flex gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-sm">person</span>
                  </div>
                  <textarea
                    className="flex-1 bg-transparent font-mono text-sm text-on-surface placeholder:text-outline resize-none outline-none leading-relaxed"
                    rows={3}
                    placeholder="// 여행 후기를 남겨주세요..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold font-label hover:brightness-110 transition-all">
                    COMMIT_COMMENT.SH
                  </button>
                </div>
              </div>
            </div>

            {/* Comment List */}
            <div className="space-y-4">
              {[
                {
                  user: 'traveler_01',
                  time: '2025-03-15 · 14:23',
                  text: '정말 아름다운 곳이었습니다. 날씨가 좋을 때 방문하면 더 좋을 것 같아요!',
                  likes: 12,
                },
                {
                  user: 'code_tripper',
                  time: '2025-03-12 · 09:11',
                  text: '주차 공간이 넉넉해서 편하게 이용했습니다. 주변 식당도 괜찮아요.',
                  likes: 7,
                },
                {
                  user: 'dev_traveler',
                  time: '2025-03-08 · 17:45',
                  text: '가족들과 함께 방문했는데 아이들이 정말 좋아했어요. 다음에 또 오고 싶습니다.',
                  likes: 21,
                },
              ].map((comment, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-sm">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-xs font-mono font-bold text-primary">@{comment.user}</span>
                          <span className="text-[10px] text-outline font-mono ml-3">{comment.time}</span>
                        </div>
                        <button className="flex items-center gap-1 text-outline hover:text-primary transition-colors text-[11px] font-mono">
                          <span className="material-symbols-outlined text-sm">favorite</span>
                          {comment.likes}
                        </button>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed font-mono">
                        <span className="text-outline">"</span>
                        {comment.text}
                        <span className="text-outline">"</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right: system.env + Map */}
        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-24 flex flex-col gap-6">

            {/* system.env */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.04)] border border-outline-variant/10">
              <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">terminal</span>
                system.env
              </h3>

              {envFields.length > 0 ? (
                <div className="space-y-5">
                  {envFields.map((field, i) => (
                    <div key={i} className="flex justify-between items-start gap-3 group">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-label text-outline uppercase tracking-wider mb-1">
                          {field.label}
                        </p>
                        {field.html ? (
                          <p
                            className="text-sm font-headline font-medium text-on-surface leading-snug break-words [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                            dangerouslySetInnerHTML={{ __html: field.value }}
                          />
                        ) : (
                          <p className="text-sm font-headline font-medium text-on-surface leading-snug break-words">
                            {field.value}
                          </p>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-xl text-surface-dim group-hover:text-primary transition-colors flex-shrink-0 mt-0.5">
                        {field.icon}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-mono text-outline italic">// 부가 정보 없음</p>
              )}

              <div className="pt-6 mt-6 border-t border-outline-variant/10">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-primary-container text-on-primary-container py-3 rounded-lg font-label text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  목록으로 돌아가기
                </button>
              </div>
            </div>

            {/* Map */}
            {common.mapx && common.mapy && (
              <div className="rounded-xl overflow-hidden border border-outline-variant/10 shadow-[0_4px_20px_rgba(25,28,30,0.04)]">
                <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low border-b border-outline-variant/10">
                  <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                  <span className="text-xs font-label font-bold text-on-surface uppercase tracking-wider">위치 정보</span>
                </div>
                <Map
                  center={{ lat: parseFloat(common.mapy), lng: parseFloat(common.mapx) }}
                  style={{ width: '100%', height: '260px' }}
                  level={3}

                  onCreate={(map) => {
                    const markerPosition = new window.kakao.maps.LatLng(
                      parseFloat(common.mapy),
                      parseFloat(common.mapx)
                    );
                    // 2. 마커 객체 생성
                    const marker = new window.kakao.maps.Marker({
                      position: markerPosition
                    });
                    // 3. 마커를 지도 위에 표시
                    marker.setMap(map);
                  }}
                />
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default TravelDetail;
