import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getDetailCommon, getDetailIntro, getDetailInfo, getDetailImage } from '../api/travelInfoApi';
import { getComments, postComment, updateComment, deleteComment } from '../api/commentApi';
import useAuthStore from '../store/useAuthStore';
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
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const { isLoggedIn, user } = useAuthStore();

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
        const [introData, infoData, imageData, commentsData] = await Promise.all([
          getDetailIntro(contentId, cTypeId),
          getDetailInfo(contentId, cTypeId),
          getDetailImage(contentId),
          getComments(contentId),
        ]);

        setIntro(introData);
        setInfoItems(infoData?.items ?? []);
        setImages(imageData?.items ?? []);
        setComments(commentsData ?? []);
      } catch (err) {
        console.error('Fetch detail error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [contentId]);

  const handleCommentFocus = (e) => {
    if (!isLoggedIn) {
      e.target.blur();
      setShowLoginDialog(true);
    }
  };

  const handleCommentSubmit = async () => {
    if (!isLoggedIn || !commentText.trim() || submitting) return;
    try {
      setSubmitting(true);
      await postComment({ contentId, nickname: user.name, body: commentText.trim() });
      setCommentText('');
      const updated = await getComments(contentId);
      setComments(updated);
    } catch (err) {
      console.error('Comment post error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStart = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.body);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleEditSubmit = async (id) => {
    if (!editText.trim()) return;
    try {
      await updateComment(id, editText.trim());
      setEditingId(null);
      setEditText('');
      setComments(await getComments(contentId));
    } catch (err) {
      console.error('Comment update error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('코멘트를 삭제하시겠습니까?')) return;
    try {
      await deleteComment(id);
      setComments(await getComments(contentId));
    } catch (err) {
      console.error('Comment delete error:', err);
    }
  };

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

      {/* 로그인 유도 다이얼로그 */}
      {showLoginDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-container-low rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-outline-variant/20">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(186,26,26,0.6)' }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(90,95,101,0.6)' }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(0,184,212,0.6)' }} />
              </div>
              <span className="text-[10px] font-mono text-outline uppercase tracking-widest">auth_required.sh</span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">lock</span>
                <div>
                  <p className="font-headline font-bold text-on-surface text-sm">로그인이 필요합니다</p>
                  <p className="text-xs text-outline font-mono mt-0.5">// 코멘트 작성은 로그인 후 이용 가능합니다.</p>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowLoginDialog(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold font-label border border-outline-variant/30 text-on-secondary-container hover:bg-surface-container-high transition-all"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => { setShowLoginDialog(false); navigate('/login'); }}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold font-label bg-primary text-on-primary hover:brightness-110 transition-all"
                >
                  GO_TO_LOGIN.SH
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

          {/* Comments */}
          <div>
            <h3 className="font-headline font-bold text-lg mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">chat</span>
              코멘트
            </h3>

            {/* Comment Input */}
            <div className="bg-surface-container-low p-1 rounded-lg mb-6 shadow-sm border border-outline-variant/10">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-outline-variant/20 rounded-t-[4px]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(186,26,26,0.6)' }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(90,95,101,0.6)' }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(0,184,212,0.6)' }} />
                </div>
                <span className="text-[10px] font-mono text-outline uppercase tracking-widest">new_comment.md</span>
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
                    onFocus={handleCommentFocus}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleCommentSubmit}
                    disabled={submitting || !commentText.trim()}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold font-label hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? '// posting...' : 'COMMIT_COMMENT.SH'}
                  </button>
                </div>
              </div>
            </div>

            {/* Comment List */}
            {comments.length === 0 ? (
              <p className="text-sm font-mono text-outline text-center py-6">// 아직 코멘트가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => {
                  const isOwner = user?.id && comment.user_id === user.id;
                  const isEditing = editingId === comment.id;
                  return (
                    <div key={comment.id} className="bg-white rounded-xl p-5 border border-outline-variant/10 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-primary text-sm">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="text-xs font-mono font-bold text-primary">@{comment.nickname}</span>
                              <span className="text-[10px] text-outline font-mono ml-3">
                                {new Date(comment.created_at).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isOwner && !isEditing && (
                                <>
                                  <button
                                    onClick={() => handleEditStart(comment)}
                                    className="text-[11px] font-mono text-outline hover:text-primary transition-colors flex items-center gap-0.5"
                                  >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="text-[11px] font-mono text-outline hover:text-error transition-colors flex items-center gap-0.5"
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                  </button>
                                </>
                              )}
                              <button className="flex items-center gap-1 text-outline hover:text-primary transition-colors text-[11px] font-mono">
                                <span className="material-symbols-outlined text-sm">favorite</span>
                                {comment.likes}
                              </button>
                            </div>
                          </div>

                          {isEditing ? (
                            <div>
                              <textarea
                                className="w-full bg-surface-container-low font-mono text-sm text-on-surface resize-none outline-none leading-relaxed rounded-lg p-3 border border-primary/30 focus:border-primary transition-colors"
                                rows={3}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                autoFocus
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  onClick={handleEditCancel}
                                  className="px-3 py-1.5 text-xs font-bold font-label border border-outline-variant/30 rounded-lg text-on-secondary-container hover:bg-surface-container-high transition-all"
                                >
                                  CANCEL
                                </button>
                                <button
                                  onClick={() => handleEditSubmit(comment.id)}
                                  disabled={!editText.trim()}
                                  className="px-3 py-1.5 text-xs font-bold font-label bg-primary text-on-primary rounded-lg hover:brightness-110 transition-all disabled:opacity-40"
                                >
                                  SAVE.SH
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-600 leading-relaxed font-mono">
                              <span className="text-outline">"</span>
                              {comment.body}
                              <span className="text-outline">"</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
