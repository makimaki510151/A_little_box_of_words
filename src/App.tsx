import { GameProvider, useGame } from './game/GameContext'
import { ResourceBar } from './components/ResourceBar'
import { WorldView } from './components/WorldView'
import { PanelTabs } from './components/PanelTabs'
import { Toasts } from './components/Toasts'
import { OfflineModal } from './components/OfflineModal'
import { StoryModal } from './components/StoryModal'

function AppShell() {
  const { state } = useGame()
  const { settings } = state

  return (
    <div
      className={`app-shell font-${settings.fontSize}${settings.animations ? '' : ' reduce-motion'}`}
      data-theme={settings.colorTheme}
      style={{ transform: `scale(${settings.scale})` }}
    >
      <header className="brand-bar">
        <div>
          <h1 className="brand-title">小さな箱の言葉</h1>
          <p className="brand-sub">A Little Box of Words — タイピングで育つ箱庭</p>
        </div>
      </header>

      <ResourceBar />

      <div className="main-grid">
        <WorldView />
        <PanelTabs />
      </div>

      <p className="footer-note">
        セーブはブラウザ内に保存されます。GitHub Pages 向けのシングルプレイ作品です。
      </p>

      <Toasts />
      <OfflineModal />
      <StoryModal />
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  )
}
