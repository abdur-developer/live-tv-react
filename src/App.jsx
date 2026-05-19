// App.jsx - Main app with free components
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, Tv, Sparkles, Play, Radio, Zap, Star, TrendingUp, Clock } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';
import { getStreamUrl } from './utils/config';

// Channel data
const CHANNELS = [
  { name: "T Sports", id: "live1", url: getStreamUrl("http://103.59.176.72:8083/live1/video.m3u8?token=123") },
  { name: "Star Jalsha", id: "live2", url: getStreamUrl("http://103.59.176.72:8083/live2/video.m3u8?token=123") },
  { name: "Star Sports 1", id: "live3", url: getStreamUrl("http://103.59.176.72:8083/live3/video.m3u8?token=123") },
  { name: "Jalsha Movies", id: "live4", url: getStreamUrl("http://103.59.176.72:8083/live4/video.m3u8?token=123") },
  { name: "Star Sports 1 Hindi", id: "ss1_hindi", url: getStreamUrl("http://103.59.176.72:8083/ss1_hindi/video.m3u8?token=123") },
  { name: "Star Sports Select 1", id: "ss_select_1", url: getStreamUrl("http://103.59.176.72:8083/ss_select_1/video.m3u8?token=123") },
  { name: "Star Sports 3", id: "ss_select_2", url: getStreamUrl("http://103.59.176.72:8083/ss_select_2/video.m3u8?token=123") },
  { name: "Sun Bangla", id: "ss1_en", url: getStreamUrl("http://103.59.176.72:8083/ss1_en/video.m3u8?token=123") },
  { name: "Ananda TV", id: "ananda_tv", url: getStreamUrl("http://103.59.176.72:8083/ananda_tv/video.m3u8?token=123") },
  { name: "ATN News", id: "atn_news", url: getStreamUrl("http://103.59.176.72:8083/atn_news/video.m3u8?token=123") },
  { name: "DBC News", id: "dbc_news", url: getStreamUrl("http://103.59.176.72:8083/dbc_news/video.m3u8?token=123") },
  { name: "Ekattor TV", id: "ekattor_tv", url: getStreamUrl("http://103.59.176.72:8083/ekattor_tv/video.m3u8?token=123") },
  { name: "Jamuna TV", id: "jamuna_tv", url: getStreamUrl("http://103.59.176.72:8083/jamuna_tv/video.m3u8?token=123") },
  { name: "News24", id: "news24", url: getStreamUrl("http://103.59.176.72:8083/news24/video.m3u8?token=123") },
  { name: "Somoy TV", id: "somoy_tv", url: getStreamUrl("http://103.59.176.72:8083/somoy_tv/video.m3u8?token=123") },
  { name: "Channel 24", id: "channel24", url: getStreamUrl("http://103.59.176.72:8083/channel24/video.m3u8?token=123") },
  { name: "Bangla Vision", id: "banglavision", url: getStreamUrl("http://103.59.176.72:8083/banglavision/video.m3u8?token=123") },
  { name: "Bijoy TV", id: "bijoy_tv", url: getStreamUrl("http://103.59.176.72:8083/bijoy_tv/video.m3u8?token=123") },
  { name: "Boishakhi TV", id: "boishakhi_tv", url: getStreamUrl("http://103.59.176.72:8083/boishakhi_tv/video.m3u8?token=123") },
  { name: "BTV World", id: "btv_world", url: getStreamUrl("http://103.59.176.72:8083/btv_world/video.m3u8?token=123") },
  { name: "Channel 9", id: "channel_9", url: getStreamUrl("http://103.59.176.72:8083/channel_9/video.m3u8?token=123") },
  { name: "Channel i", id: "channel_i", url: getStreamUrl("http://103.59.176.72:8083/channel_i/video.m3u8?token=123") },
  { name: "Deepto TV", id: "deepto_tv", url: getStreamUrl("http://103.59.176.72:8083/deepto_tv/video.m3u8?token=123") },
  { name: "Desh TV", id: "desh_tv", url: getStreamUrl("http://103.59.176.72:8083/desh_tv/video.m3u8?token=123") },
  { name: "Ekushey TV", id: "ekushey_tv", url: getStreamUrl("http://103.59.176.72:8083/ekushey_tv/video.m3u8?token=123") },
  { name: "GTV", id: "gtv", url: getStreamUrl("http://103.59.176.72:8083/gtv/video.m3u8?token=123") },
  { name: "Mohona TV", id: "mohona_tv", url: getStreamUrl("http://103.59.176.72:8083/mohona_tv/video.m3u8?token=123") },
  { name: "Global HD Television", id: "global_hd", url: getStreamUrl("http://103.59.176.72:8083/global_hd/video.m3u8?token=123") },
  { name: "Maasranga TV", id: "maasranga", url: getStreamUrl("http://103.59.176.72:8083/maasranga/video.m3u8?token=123") },
  { name: "Nexus Television", id: "nexus_tv", url: getStreamUrl("http://103.59.176.72:8083/nexus_tv/video.m3u8?token=123") },
  { name: "Rtv", id: "rtv", url: getStreamUrl("http://103.59.176.72:8083/rtv/video.m3u8?token=123") },
  { name: "SATV", id: "satv", url: getStreamUrl("http://103.59.176.72:8083/satv/video.m3u8?token=123") },
  { name: "My TV", id: "mytv", url: getStreamUrl("http://103.59.176.72:8083/mytv/video.m3u8?token=123") },
  { name: "Nagorik TV", id: "nagorik_tv", url: getStreamUrl("http://103.59.176.72:8083/nagorik_tv/video.m3u8?token=123") },
  { name: "Sun Bangla", id: "sun_bangla", url: getStreamUrl("http://103.59.176.72:8083/sun_bangla/video.m3u8?token=123") },
  { name: "Star Sports 3", id: "star_sports_3", url: getStreamUrl("http://103.59.176.72:8083/star_sports_3/video.m3u8?token=123") },
  { name: "Duronto TV", id: "duronto_tv", url: getStreamUrl("http://103.59.176.72:8083/duronto_tv/video.m3u8?token=123") }
];

// Helper functions
const classifyChannel = (name) => {
  const n = name.toLowerCase();
  if (['sport', 'star sport', 't sports', 'cricket', 'football'].some(k => n.includes(k))) return 'sports';
  if (['news', 'atn', 'dbc', 'ekattor', 'jamuna', 'somoy', 'channel 24', 'news24', 'nagorik'].some(k => n.includes(k))) return 'news';
  return 'entertainment';
};
const wpOpen = () => {
    window.open(
      "https://wa.me/8801709409266?text=From+Num+to+Name",
      "_blank"
    );
  }
const getAbbreviation = (name) => {
  const words = name.split(/\s+/);
  return words.length >= 2 
    ? (words[0][0] + words[1][0]).toUpperCase() 
    : name.substring(0, 2).toUpperCase();
};

const getCategoryGradient = (category) => {
  const gradients = {
    sports: 'from-emerald-400 via-green-500 to-teal-600',
    news: 'from-rose-400 via-red-500 to-pink-600',
    entertainment: 'from-violet-400 via-purple-500 to-indigo-600'
  };
  return gradients[category] || 'from-slate-400 to-slate-600';
};

const enhancedChannels = CHANNELS.map((ch, index) => ({
  ...ch,
  category: classifyChannel(ch.name),
  abbreviation: getAbbreviation(ch.name),
  isPopular: index < 10,
  isTrending: index < 5,
  isHD: Math.random() > 0.3,
  viewers: Math.floor(Math.random() * 50000) + 1000
}));

// Default channel - Star Sports 1
const DEFAULT_CHANNEL = enhancedChannels.find(ch => ch.id === 'live3') || enhancedChannels[0];

// Channel Card Component
const ChannelCard = ({ channel, isActive, onClick }) => {
  return (
    <button
      onClick={() => onClick(channel)}
      className={`group relative w-full text-left transition-all duration-500 ease-out ${
        isActive 
          ? 'scale-[1.02] -translate-y-1' 
          : 'hover:scale-[1.01] hover:-translate-y-0.5'
      }`}
    >
      <div className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-br from-white/15 to-white/5 border-2 border-white/20 shadow-2xl'
          : 'bg-white/[0.03] border-2 border-transparent hover:bg-white/[0.08] hover:border-white/10'
      }`}>
        <div className="relative p-4">
          <div className="flex items-center gap-4">
            <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${getCategoryGradient(channel.category)} flex items-center justify-center font-bold text-white shadow-xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
              <span className="text-lg">{channel.abbreviation}</span>
              {channel.isHD && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-yellow-500 text-[10px] font-black text-black rounded-md shadow-lg">
                  HD
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white truncate text-[15px]">{channel.name}</h3>
                {channel.isTrending && <TrendingUp className="w-4 h-4 text-orange-400 flex-shrink-0" />}
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium capitalize bg-gradient-to-r ${getCategoryGradient(channel.category)} text-white`}>
                  {channel.category}
                </span>
                <span className="text-xs text-gray-500">{channel.viewers.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              {isActive ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/20 rounded-full border border-red-500/30">
                  <div className="relative">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  </div>
                  <span className="text-[11px] font-bold text-red-400">LIVE</span>
                </div>
              ) : (
                <div className="w-2 h-2 bg-gray-600 rounded-full" />
              )}
              {channel.isPopular && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

// Main App Component
export default function App() {
  const [activeChannel, setActiveChannel] = useState(DEFAULT_CHANNEL);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [recentChannels, setRecentChannels] = useState([]);
  const [showRecentOnly, setShowRecentOnly] = useState(false);

  // Load default channel on mount
  useEffect(() => {
    handleChannelSelect(DEFAULT_CHANNEL);
  }, []);

  // Filter and search channels
  const filteredChannels = useMemo(() => {
    let channels = showRecentOnly ? recentChannels : enhancedChannels;
    
    return channels.filter(ch => {
      const matchCategory = activeFilter === 'all' || ch.category === activeFilter;
      const matchSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeFilter, searchQuery, showRecentOnly, recentChannels]);

  const popularChannels = useMemo(() => {
    return enhancedChannels.filter(ch => ch.isPopular).slice(0, 8);
  }, []);

  const handleChannelSelect = useCallback((channel) => {
    if (activeChannel?.id === channel.id) return;
    
    setIsLoading(true);
    setActiveChannel(channel);
    
    setRecentChannels(prev => {
      const filtered = prev.filter(ch => ch.id !== channel.id);
      return [channel, ...filtered].slice(0, 10);
    });
  }, [activeChannel]);

  const filters = [
    { id: 'all', label: 'All', icon: Tv },
    { id: 'sports', label: 'Sports', icon: Play },
    { id: 'news', label: 'News', icon: Radio },
    { id: 'entertainment', label: 'Entertainment', icon: Sparkles }
  ];

  const stats = {
    total: enhancedChannels.length,
    live: enhancedChannels.length,
    sports: enhancedChannels.filter(ch => ch.category === 'sports').length,
    news: enhancedChannels.filter(ch => ch.category === 'news').length,
    entertainment: enhancedChannels.filter(ch => ch.category === 'entertainment').length
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-white/[0.08]">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <Tv className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  LIVE TV
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-wider">Free Streaming</p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-6 px-6 py-3 bg-white/[0.03] rounded-2xl border border-white/[0.08]">
              <div className="text-center">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-0.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  LIVE
                </div>
                <div className="text-white font-bold text-lg">{stats.live}</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-gray-400 text-xs font-medium mb-0.5">SPORTS</div>
                <div className="text-white font-bold text-lg">{stats.sports}</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-gray-400 text-xs font-medium mb-0.5">NEWS</div>
                <div className="text-white font-bold text-lg">{stats.news}</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-gray-400 text-xs font-medium mb-0.5">ENT</div>
                <div className="text-white font-bold text-lg">{stats.entertainment}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-[1800px] mx-auto p-2 lg:px-6 lg:py-6">
        <div className="grid lg:grid-cols-[1fr,420px] gap-8">
          {/* Left: Player Section */}
          <div className="space-y-6">
            <VideoPlayer 
              channel={activeChannel}
              onLoad={() => setIsLoading(false)}
              onError={(error) => console.error('Stream error:', error)}
            />
            
            {/* Channel Info */}
            {activeChannel && (
              <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-1 lg:p-6">
                <div className="flex items-start justify-between lg:p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getCategoryGradient(activeChannel.category)} flex items-center justify-center text-2xl font-black text-white shadow-2xl`}>
                      {activeChannel.abbreviation}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{activeChannel.name}</h2>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize bg-gradient-to-r ${getCategoryGradient(activeChannel.category)} text-white`}>
                          {activeChannel.category}
                        </span>
                        <div className="flex items-center min-w-20 gap-2">
                          <div className="relative">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                          </div>
                          <span className="text-red-400 text-xs font-bold">LIVE NOW</span>
                        </div>
                        {activeChannel.isHD && (
                          <span className="px-1 lg:px-2 lg:py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-lg border border-yellow-500/30">HD</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center h-[-webkit-fill-available]">
                    <div className="text-gray-400 text-sm">{activeChannel.viewers.toLocaleString()} watching</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Popular Channels */}
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-bold text-white">Popular Channels</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {popularChannels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelSelect(channel)}
                    className="group p-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/20 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${getCategoryGradient(channel.category)} flex items-center justify-center text-lg font-bold text-white shadow-lg`}>
                      {channel.abbreviation}
                    </div>
                    <p className="text-sm text-center text-gray-400 group-hover:text-white font-medium truncate">
                      {channel.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-140px)]">
            {/* Search & Filters */}
            <div className="p-5 border-b border-white/[0.08] space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-sm"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {filters.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveFilter(id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                      activeFilter === id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                        : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
                {recentChannels.length > 0 && (
                  <button
                    onClick={() => setShowRecentOnly(!showRecentOnly)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                      showRecentOnly
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                        : 'bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Recent
                  </button>
                )}
              </div>
            </div>

            {/* Channel List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
              {filteredChannels.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 bg-white/[0.03] rounded-full flex items-center justify-center">
                    <Tv className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No channels found</h3>
                  <p className="text-sm text-gray-600">Try adjusting your search or filters</p>
                </div>
              ) : (
                <>
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-500 font-medium">
                      {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  
                  {filteredChannels.map((channel, index) => (
                    <ChannelCard
                      key={channel.id}
                      channel={channel}
                      isActive={activeChannel?.id === channel.id}
                      onClick={handleChannelSelect}
                      index={index}
                    />
                  ))}
                </>
              )}
            </div>
            
            <div className="p-4 border-t border-white/[0.08]">
               <p className="text-center text-[10px] sm:text-xs text-blue-400 mt-3 sm:mt-4 font-light cursor-pointer" onClick={wpOpen}>
                  Designed & Developed by Abdur Rahman
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}