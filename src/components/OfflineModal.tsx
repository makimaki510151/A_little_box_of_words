import { formatDuration } from '../game/production'
import { formatResourceGain, hasAnyResource } from '../game/resources'
import { useGame } from '../game/GameContext'

export function OfflineModal() {
  const { offlineGain, claimOffline, dismissOffline } = useGame()
  if (!offlineGain || !hasAnyResource(offlineGain.gain)) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="offline-title">
      <div className="modal">
        <h2 id="offline-title">おかえりなさい</h2>
        <p className="panel-desc">
          不在時間 {formatDuration(offlineGain.elapsedMs)}
          {offlineGain.elapsedMs > offlineGain.cappedMs
            ? `（上限 ${formatDuration(offlineGain.cappedMs)} まで反映）`
            : ''}
        </p>
        <div className="result-banner">{formatResourceGain(offlineGain.gain)}</div>
        <div className="typing-actions" style={{ marginTop: '1rem' }}>
          <button type="button" className="btn btn-primary" onClick={claimOffline}>
            受け取る
          </button>
          <button type="button" className="btn btn-ghost" onClick={dismissOffline}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
