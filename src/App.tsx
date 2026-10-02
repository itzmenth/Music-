import React, { useState } from 'react';
import { MusicProvider, useMusic } from './context/MusicContext';
import { PhoneShell } from './components/PhoneShell';
import { HubPanorama } from './components/HubPanorama';
import { NowPlayingView } from './components/NowPlayingView';
import { StartScreen } from './components/StartScreen';
import {
  ArtistDetailView,
  AlbumDetailView,
  PlaylistDetailView,
} from './components/DetailViews';
import { MetroAppBar } from './components/MetroAppBar';
import { EqualizerModal } from './components/EqualizerModal';
import { AddMusicModal } from './components/AddMusicModal';
import { SettingsModal } from './components/SettingsModal';
import { JumpListModal } from './components/JumpListModal';

const MainAppContent: React.FC = () => {
  const { currentView } = useMusic();

  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isAddMusicOpen, setIsAddMusicOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <PhoneShell>
      {/* Dynamic View Router */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {currentView === 'hub' && <HubPanorama />}
        {currentView === 'nowPlaying' && <NowPlayingView />}
        {currentView === 'startScreen' && <StartScreen />}
        {currentView === 'artistDetail' && <ArtistDetailView />}
        {currentView === 'albumDetail' && <AlbumDetailView />}
        {currentView === 'playlistDetail' && <PlaylistDetailView />}
      </div>

      {/* Signature Windows Phone Application Bar */}
      <MetroAppBar
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        onOpenAddMusic={() => setIsAddMusicOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSleepTimer={() => setIsSettingsOpen(true)}
      />

      {/* Floating System Modals */}
      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
      />

      <AddMusicModal
        isOpen={isAddMusicOpen}
        onClose={() => setIsAddMusicOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <JumpListModal />
    </PhoneShell>
  );
};

export default function App() {
  return (
    <MusicProvider>
      <MainAppContent />
    </MusicProvider>
  );
}
