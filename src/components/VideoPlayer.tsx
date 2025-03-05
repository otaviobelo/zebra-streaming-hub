
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Channel } from '@/lib/types';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

interface VideoPlayerProps {
  channel: Channel;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    let hls: Hls | null = null;

    const loadVideo = () => {
      setError(null);
      
      if (Hls.isSupported()) {
        hls = new Hls({ maxBufferLength: 30 });
        hls.loadSource(channel.streamUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isPlaying) videoElement.play().catch(() => {
            // Handle autoplay restrictions by muting and trying again
            videoElement.muted = true;
            setIsMuted(true);
            videoElement.play().catch(err => {
              console.error('Failed to play video:', err);
              setError('Não foi possível reproduzir o vídeo. Clique para tentar novamente.');
              setIsPlaying(false);
            });
          });
        });
        
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.error('HLS error:', data);
            setError('Erro ao carregar a transmissão. Clique para tentar novamente.');
            hls?.destroy();
            setTimeout(() => loadVideo(), 3000); // Auto retry
          }
        });
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        videoElement.src = channel.streamUrl;
        videoElement.addEventListener('loadedmetadata', () => {
          if (isPlaying) videoElement.play().catch(err => {
            console.error('Failed to play video:', err);
            setError('Não foi possível reproduzir o vídeo. Clique para tentar novamente.');
            setIsPlaying(false);
          });
        });
      } else {
        setError('Seu navegador não suporta a reprodução deste vídeo.');
      }
    };

    loadVideo();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [channel.streamUrl, isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (error) {
      setError(null);
      // Reload video
      video.load();
      setIsPlaying(true);
      return;
    }

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Failed to play:', err);
        setError('Não foi possível reproduzir o vídeo.');
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(false);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="mx-auto max-w-5xl aspect-video flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          onClick={togglePlay}
        />
      </div>
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-center p-4" onClick={togglePlay}>
          <div className="max-w-md">
            <p className="mb-4">{error}</p>
            <button 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
                videoRef.current?.load();
                setIsPlaying(true);
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      <div className={`player-controls ${showControls ? 'opacity-100' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={togglePlay}
              className="text-white hover:text-primary transition-colors"
              aria-label={isPlaying ? "Pausar" : "Reproduzir"}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button 
              onClick={toggleMute}
              className="text-white hover:text-primary transition-colors"
              aria-label={isMuted ? "Ativar som" : "Desativar som"}
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            
            <div className="text-white text-sm font-medium">
              {channel.name}
            </div>
          </div>
          
          <button 
            onClick={toggleFullscreen}
            className="text-white hover:text-primary transition-colors"
            aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          >
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
