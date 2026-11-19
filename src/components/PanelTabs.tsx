import { useGame } from '../game/GameContext'
import type { PanelId } from '../types/game'
import { TypingPanel } from './TypingPanel'
import { FacilityPanel } from './FacilityPanel'
import { ResidentPanel } from './ResidentPanel'
import { StoryPanel } from './StoryPanel'
import { CodexPanel } from './CodexPanel'
import { AchievementPanel } from './AchievementPanel'
import { SettingsPanel } from './SettingsPanel'

const TABS: { id: PanelId; label: string }[] = [
  { id: 'typing', label: 'タイピング' },
  { id: 'facility', label: '施設' },
  { id: 'resident', label: '住人' },
  { id: 'story', label: '物語' },
  { id: 'codex', label: '図鑑' },
  { id: 'achievement', label: '実績' },
  { id: 'settings', label: '設定' },
]

export function PanelTabs() {
  const { activePanel, setActivePanel } = useGame()

  return (
    <div className="right-stack">
      <nav className="tab-bar" aria-label="機能メニュー">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-btn ${activePanel === tab.id ? 'active' : ''}`}
            onClick={() => setActivePanel(tab.id)}
            aria-current={activePanel === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="panel content-panel" aria-live="polite">
        {activePanel === 'typing' && <TypingPanel />}
        {activePanel === 'facility' && <FacilityPanel />}
        {activePanel === 'resident' && <ResidentPanel />}
        {activePanel === 'story' && <StoryPanel />}
        {activePanel === 'codex' && <CodexPanel />}
        {activePanel === 'achievement' && <AchievementPanel />}
        {activePanel === 'settings' && <SettingsPanel />}
      </section>
    </div>
  )
}
