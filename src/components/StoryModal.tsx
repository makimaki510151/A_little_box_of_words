import { useGame } from '../game/GameContext'

export function StoryModal() {
  const { storyModal, closeStoryModal } = useGame()
  if (!storyModal) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="story-title">
      <div className="modal">
        <h2 id="story-title">{storyModal.title}</h2>
        <p className="panel-desc">{storyModal.summary}</p>
        <div className="dialogue">
          {storyModal.dialogues.map((line, i) => (
            <div key={`${storyModal.id}-m-${i}`} className="dialogue-line">
              <span className="speaker">{line.speaker}</span>
              {line.text}
            </div>
          ))}
        </div>
        <div className="typing-actions" style={{ marginTop: '1rem' }}>
          <button type="button" className="btn btn-primary" onClick={closeStoryModal}>
            続ける
          </button>
        </div>
      </div>
    </div>
  )
}
