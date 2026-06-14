/**
 * @name NutFlux 视频流媒体 APP
 *
 * 一款现代化的视频流媒体移动应用，提供视频点播、直播、内容发现和社交互动功能。
 */

import React, { useState, useRef, useEffect } from 'react';
import './style.css';

// 类型定义
interface Video {
  id: string;
  title: string;
  cover: string;
  duration: string;
  category: string;
  rating: number;
  views: string;
  year: number;
  region: string;
  creator: string;
  progress?: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

// 模拟数据
const mockVideos: Video[] = [
  { id: '1', title: '星际穿越：未知边界', cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=225&fit=crop', duration: '2:15:30', category: '科幻', rating: 9.2, views: '2.3M', year: 2024, region: '美国', creator: '宇宙影业' },
  { id: '2', title: '都市爱情物语', cover: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&h=225&fit=crop', duration: '45:20', category: '爱情', rating: 8.5, views: '1.8M', year: 2024, region: '中国', creator: '浪漫工作室' },
  { id: '3', title: '荒野求生记', cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop', duration: '1:30:00', category: '纪录片', rating: 9.0, views: '3.1M', year: 2023, region: '英国', creator: '探索频道' },
  { id: '4', title: '科技前沿 2024', cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=225&fit=crop', duration: '25:00', category: '科技', rating: 8.8, views: '890K', year: 2024, region: '美国', creator: '科技视界' },
  { id: '5', title: '动漫世界大冒险', cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=225&fit=crop', duration: '24:00', category: '动漫', rating: 8.3, views: '1.2M', year: 2024, region: '日本', creator: '东京动画' },
  { id: '6', title: '美食之旅', cover: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=225&fit=crop', duration: '35:00', category: '美食', rating: 8.7, views: '2.1M', year: 2024, region: '中国', creator: '味觉传媒' },
];

const continueWatching: Video[] = [
  { id: '7', title: '悬疑推理剧场', cover: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=225&fit=crop', duration: '1:20:00', category: '悬疑', rating: 8.9, views: '1.5M', year: 2024, region: '韩国', creator: '韩剧工厂', progress: 65 },
  { id: '8', title: '自然奇观', cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop', duration: '50:00', category: '纪录片', rating: 9.5, views: '4.2M', year: 2023, region: '英国', creator: 'BBC', progress: 30 },
];

const categories: Category[] = [
  { id: '1', name: '全部', icon: '⊞' },
  { id: '2', name: '电影', icon: '🎬' },
  { id: '3', name: '电视剧', icon: '📺' },
  { id: '4', name: '综艺', icon: '🎭' },
  { id: '5', name: '动漫', icon: '🎨' },
  { id: '6', name: '纪录片', icon: '📹' },
];

// 图标组件
const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#e50914' : '#b3b3b3'}>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

const DiscoverIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#e50914' : '#b3b3b3'}>
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#e50914' : '#b3b3b3'}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#b3b3b3">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#e50914' : 'none'} stroke={filled ? '#e50914' : '#fff'} strokeWidth="2">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const BookmarkIcon = ({ filled }: { filled?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#e50914' : 'none'} stroke={filled ? '#e50914' : '#fff'} strokeWidth="2">
    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
  </svg>
);

// 视频卡片组件
const VideoCard: React.FC<{ video: Video; showProgress?: boolean; horizontal?: boolean }> = ({ 
  video, 
  showProgress = false,
  horizontal = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (horizontal) {
    return (
      <div 
        className="video-card-horizontal"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="video-cover-wrapper">
          <img src={video.cover} alt={video.title} className="video-cover" />
          <span className="video-duration">{video.duration}</span>
          {showProgress && video.progress && (
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${video.progress}%` }} />
            </div>
          )}
          {isHovered && (
            <div className="play-overlay">
              <PlayIcon />
            </div>
          )}
        </div>
        <div className="video-info">
          <h3 className="video-title">{video.title}</h3>
          <p className="video-meta">{video.category} · {video.views}次观看</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="video-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="video-cover-wrapper">
        <img src={video.cover} alt={video.title} className="video-cover" />
        <span className="video-duration">{video.duration}</span>
        {showProgress && video.progress && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${video.progress}%` }} />
          </div>
        )}
        {isHovered && (
          <div className="play-overlay">
            <PlayIcon />
          </div>
        )}
      </div>
      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        <p className="video-meta">{video.creator} · {video.views}次观看</p>
        <div className="video-rating">
          <span className="rating-star">★</span>
          <span>{video.rating}</span>
        </div>
      </div>
    </div>
  );
};

// 轮播 Banner 组件
const BannerCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const banners = mockVideos.slice(0, 4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="banner-carousel">
      <div className="banner-container" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {banners.map((video, index) => (
          <div key={video.id} className="banner-slide">
            <img src={video.cover} alt={video.title} className="banner-image" />
            <div className="banner-overlay">
              <h2 className="banner-title">{video.title}</h2>
              <p className="banner-desc">{video.category} · {video.rating}分 · {video.views}观看</p>
              <button className="banner-play-btn">
                <PlayIcon /> 立即播放
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="banner-dots">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`banner-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

// 首页组件
const HomePage: React.FC = () => {
  return (
    <div className="page home-page">
      {/* 搜索栏 */}
      <div className="search-bar">
        <SearchIcon />
        <input type="text" placeholder="搜索视频、创作者..." className="search-input" />
      </div>

      {/* 轮播 Banner */}
      <BannerCarousel />

      {/* 继续观看 */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">继续观看</h2>
          <button className="see-all-btn">查看全部</button>
        </div>
        <div className="horizontal-scroll">
          {continueWatching.map(video => (
            <VideoCard key={video.id} video={video} showProgress horizontal />
          ))}
        </div>
      </section>

      {/* 热门推荐 */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">热门推荐</h2>
          <button className="see-all-btn">查看全部</button>
        </div>
        <div className="horizontal-scroll">
          {mockVideos.slice(0, 4).map(video => (
            <VideoCard key={video.id} video={video} horizontal />
          ))}
        </div>
      </section>

      {/* 新片上架 */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">新片上架</h2>
          <button className="see-all-btn">查看全部</button>
        </div>
        <div className="video-grid">
          {mockVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
    </div>
  );
};

// 发现页组件
const DiscoverPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="page discover-page">
      {/* 搜索框 */}
      <div className="search-box">
        <SearchIcon />
        <input 
          type="text" 
          placeholder="搜索视频、创作者、标签..." 
          className="search-input-large"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 分类标签 */}
      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* 筛选器 */}
      <div className="filter-bar">
        <button className="filter-btn">地区 ▼</button>
        <button className="filter-btn">年份 ▼</button>
        <button className="filter-btn">语言 ▼</button>
        <button className="filter-btn">评分 ▼</button>
      </div>

      {/* 视频网格 */}
      <div className="video-grid-full">
        {mockVideos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {/* 加载更多 */}
      <button className="load-more-btn">加载更多</button>
    </div>
  );
};

// 视频播放器组件
const VideoPlayer: React.FC<{ video: Video; onClose: () => void }> = ({ video, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <div className="video-player-overlay">
      <div className="video-player-container">
        {/* 播放器头部 */}
        <div className="player-header">
          <button className="back-btn" onClick={onClose}>←</button>
          <span className="player-title">{video.title}</span>
          <button className="more-btn">⋮</button>
        </div>

        {/* 视频播放区域 */}
        <div className="player-video-area">
          <img src={video.cover} alt={video.title} className="player-video" />
          {!isPlaying && (
            <div className="player-play-overlay" onClick={() => setIsPlaying(true)}>
              <PlayIcon />
            </div>
          )}
        </div>

        {/* 播放控制栏 */}
        <div className="player-controls">
          <button className="control-btn" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="time-display">
              <span>00:00</span> / <span>{video.duration}</span>
            </div>
          </div>
          <button className="control-btn">全屏</button>
        </div>

        {/* 视频信息 */}
        <div className="player-info">
          <h2 className="player-video-title">{video.title}</h2>
          <div className="player-video-meta">
            <span>{video.views}次观看</span>
            <span>·</span>
            <span>{video.year}</span>
            <span>·</span>
            <span>{video.category}</span>
            <span>·</span>
            <span className="rating">★ {video.rating}</span>
          </div>
          <p className="player-video-desc">
            这是一部精彩的{video.category}作品，由{video.creator}制作。
            影片讲述了引人入胜的故事，深受观众喜爱。
          </p>
          <div className="video-tags">
            <span className="tag">{video.region}</span>
            <span className="tag">{video.category}</span>
            <span className="tag">热门</span>
          </div>
        </div>

        {/* 互动按钮 */}
        <div className="action-buttons">
          <button 
            className={`action-btn ${isLiked ? 'active' : ''}`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <HeartIcon filled={isLiked} />
            <span>点赞</span>
          </button>
          <button 
            className={`action-btn ${isBookmarked ? 'active' : ''}`}
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <BookmarkIcon filled={isBookmarked} />
            <span>收藏</span>
          </button>
          <button className="action-btn">
            <ShareIcon />
            <span>分享</span>
          </button>
        </div>

        {/* 评论区 */}
        <div className="comments-section">
          <h3 className="comments-title">评论 (128)</h3>
          <div className="comment-item">
            <div className="comment-avatar"></div>
            <div className="comment-content">
              <div className="comment-author">用户123</div>
              <div className="comment-text">太精彩了！强烈推荐给大家！</div>
              <div className="comment-actions">
                <span>2小时前</span>
                <span>👍 23</span>
                <span>回复</span>
              </div>
            </div>
          </div>
        </div>

        {/* 相关推荐 */}
        <div className="related-videos">
          <h3 className="related-title">相关推荐</h3>
          <div className="video-list">
            {mockVideos.slice(0, 3).map(v => (
              <div key={v.id} className="video-list-item">
                <img src={v.cover} alt={v.title} className="video-list-thumb" />
                <div className="video-list-info">
                  <h4>{v.title}</h4>
                  <p>{v.creator} · {v.views}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 我的页面组件
const ProfilePage: React.FC = () => {
  return (
    <div className="page profile-page">
      {/* 用户信息卡片 */}
      <div className="user-card">
        <div className="user-avatar">
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="头像" />
        </div>
        <div className="user-info">
          <h2 className="user-name">NutFlux 用户</h2>
          <p className="user-id">ID: 88888888</p>
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-value">128</span>
              <span className="stat-label">关注</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">2.5k</span>
              <span className="stat-label">粉丝</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">1.2w</span>
              <span className="stat-label">获赞</span>
            </div>
          </div>
        </div>
      </div>

      {/* 功能列表 */}
      <div className="feature-list">
        <div className="feature-item">
          <span className="feature-icon">📺</span>
          <span className="feature-name">观看历史</span>
          <span className="feature-arrow">›</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">⭐</span>
          <span className="feature-name">我的收藏</span>
          <span className="feature-arrow">›</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">👥</span>
          <span className="feature-name">我的关注</span>
          <span className="feature-arrow">›</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">💬</span>
          <span className="feature-name">我的评论</span>
          <span className="feature-arrow">›</span>
        </div>
      </div>

      {/* 设置列表 */}
      <div className="feature-list">
        <div className="feature-item">
          <span className="feature-icon">⚙️</span>
          <span className="feature-name">设置</span>
          <span className="feature-arrow">›</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">❓</span>
          <span className="feature-name">帮助与反馈</span>
          <span className="feature-arrow">›</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">ℹ️</span>
          <span className="feature-name">关于 NutFlux</span>
          <span className="feature-arrow">›</span>
        </div>
      </div>
    </div>
  );
};

// 底部导航组件
const BottomNav: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ 
  activeTab, 
  onTabChange 
}) => {
  return (
    <div className="bottom-nav">
      <button 
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
      >
        <HomeIcon active={activeTab === 'home'} />
        <span>首页</span>
      </button>
      <button 
        className={`nav-item ${activeTab === 'discover' ? 'active' : ''}`}
        onClick={() => onTabChange('discover')}
      >
        <DiscoverIcon active={activeTab === 'discover'} />
        <span>发现</span>
      </button>
      <button 
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onTabChange('profile')}
      >
        <ProfileIcon active={activeTab === 'profile'} />
        <span>我的</span>
      </button>
    </div>
  );
};

// 主应用组件
const NutFluxApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'discover':
        return <DiscoverPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="nutflux-app">
      <div className="app-container">
        {renderPage()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {selectedVideo && (
        <VideoPlayer 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}
    </div>
  );
};

export default NutFluxApp;
