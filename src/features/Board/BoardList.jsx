import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './BoardList.css';

const BoardList = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const API_URL = "https://apis.data.go.kr/B551011/PhotoGalleryService1/galleryList1";
      
      const response = await axios.get(API_URL, {
        params: {
          serviceKey: '30c101860f786aa747448d41861649cd3e286de4a9f1beac784e5eb031c11d28',
          pageNo: 1,
          numOfRows: 20,
          MobileOS: 'ETC',
          MobileApp: 'AppTest',
          _type: 'json',
        }
      });
      
      const items = response.data?.response?.body?.items?.item || [];
      setPosts(items); 
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchPosts();
    }
    return () => { isMounted = false; };
  }, [fetchPosts]);

  const filteredPosts = posts.filter(post => 
    post.galTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.galPhotographyLocation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[#006879] font-['Space_Grotesk'] text-sm">
          <span className="w-2 h-2 rounded-full bg-[#006879] animate-pulse"></span>
          LIVE_DATA_FEED
        </div>
        <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-[#191c1e]">Recommended Nodes</h2>
        
        <div className="search-box mt-4 relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6c797d] text-sm">search</span>
          <input 
            type="text" 
            placeholder="Search nodes by title or location..." 
            className="w-full bg-[#e6e8ea] border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#006879] focus:bg-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006879]"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post, index) => (
            <div key={post.galContentId || index} className="bg-white rounded-xl overflow-hidden border border-[#bbc9cd]/10 hover:border-[#006879]/30 transition-all group shadow-sm">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 aspect-video md:aspect-auto h-48 md:h-64 overflow-hidden">
                  <img 
                    alt={post.galTitle} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    src={post.galWebImageUrl} 
                  />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="font-['Space_Grotesk'] font-bold text-2xl text-[#191c1e]">{post.galTitle}</div>
                      <div className="px-3 py-1 bg-[#f2f4f6] rounded-lg font-['Space_Grotesk'] text-[10px] text-[#5e6369] uppercase tracking-tighter">
                        ID: {post.galContentId}
                      </div>
                    </div>
                    
                    <div className="font-mono text-sm space-y-1 bg-[#f2f4f6] p-4 rounded-lg">
                      <p><span className="syntax-keyword">const</span> <span className="syntax-function">location</span> = <span className="syntax-string">'{post.galPhotographyLocation}'</span>;</p>
                      <p><span className="syntax-keyword">let</span> <span className="syntax-function">photographer</span> = <span className="syntax-string">'{post.galPhotographer}'</span>;</p>
                      <p className="syntax-comment">// Created: {post.galCreatedtime}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center">
                    <div className="flex gap-4 text-xs font-['Space_Grotesk'] text-[#5e6369] uppercase">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span> {post.galPhotographyLocation}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_month</span> {post.galCreatedtime.substring(0, 8)}</span>
                    </div>
                    <button className="text-[#006879] font-['Space_Grotesk'] font-bold hover:translate-x-1 transition-transform flex items-center gap-2">
                      VIEW_DETAILS
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardList;
