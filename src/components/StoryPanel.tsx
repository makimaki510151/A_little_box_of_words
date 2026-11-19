import { describeUnlock } from '../game/unlocks'
import { useGame } from '../game/GameContext'

export function StoryPanel() {
  const { state, stories, readStory } = useGame()

  return (
    <div>
      <h2 className="panel-title">物語</h2>
      <p className="panel-desc">第一章『小箱の中の世界』。進行に応じて節が解放されます。</p>

      <div className="list">
        {stories.map((story) => {
          const unlocked = state.unlockedStories.includes(story.id)
          const read = state.readStories.includes(story.id)
          return (
            <article key={story.id} className={`list-item ${unlocked ? '' : 'locked'}`}>
              <div className="list-item-header">
                <h3>{unlocked ? story.title : '？？？'}</h3>
                {unlocked && !read && <span className="badge">NEW</span>}
                {read && <span className="badge" style={{ color: 'var(--ink-soft)', background: 'transparent', border: '1px solid var(--line)' }}>既読</span>}
              </div>
              <p>{unlocked ? story.summary : describeUnlock(story.unlockCondition)}</p>
              {unlocked && (
                <>
                  <div className="dialogue">
                    {story.dialogues.map((line, i) => (
                      <div key={`${story.id}-${i}`} className="dialogue-line">
                        <span className="speaker">{line.speaker}</span>
                        {line.text}
                      </div>
                    ))}
                  </div>
                  {!read && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ marginTop: '0.7rem' }}
                      onClick={() => readStory(story.id)}
                    >
                      読了する
                    </button>
                  )}
                </>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
