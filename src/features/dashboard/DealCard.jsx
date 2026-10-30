import { Link } from 'react-router-dom';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/common/Badge.jsx';
import { Avatar, AvatarStack } from '../../components/common/Avatar.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export function DealCard({ model }) {
  if (!model) return null;

  // Badge icon & variant configuration per specification:
  // urgent: warning + Clock, soon: info + Clock, closed: success + CheckCircle2, normal: neutral
  let badgeVariant = 'neutral';
  let BadgeIcon = null;

  if (model.urgency === 'urgent') {
    badgeVariant = 'warning';
    BadgeIcon = Clock;
  } else if (model.urgency === 'soon') {
    badgeVariant = 'info';
    BadgeIcon = Clock;
  } else if (model.urgency === 'closed') {
    badgeVariant = 'success';
    BadgeIcon = CheckCircle2;
  }

  const participantNames = model.participants.map((p) => p.name).join(', ');

  return (
    <Link
      to={`/deals/${model.id}`}
      className="min-h-[88px] block bg-surface border border-line rounded-xl p-4 transition-all hover:bg-surface-raised hover:border-line-strong shadow-xs group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand text-left space-y-3"
    >
      {/* Header: Address and Stage Badge */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-ink group-hover:text-brand transition-colors break-words flex-1 min-w-0">
          {model.address}
        </h2>
        <Badge variant={badgeVariant} className="shrink-0 gap-1.5 py-1">
          {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
          <span className="break-words">{model.stageLabel}</span>
        </Badge>
      </div>

      {/* Escrow Progress Bar (in_escrow only) */}
      {model.escrowProgress && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium text-ink-soft">Escrow timeline</span>
            <span className="font-semibold text-ink tabular-nums">
              Day {model.escrowProgress.day} of {model.escrowProgress.total}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label={`Escrow day ${model.escrowProgress.day} of ${model.escrowProgress.total}`}
            aria-valuenow={model.escrowProgress.day}
            aria-valuemin={1}
            aria-valuemax={model.escrowProgress.total}
            className="h-2 w-full bg-surface-raised rounded-full overflow-hidden border border-line"
          >
            <div
              className="h-full bg-brand transition-all rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, model.escrowProgress.percent))}%` }}
            />
          </div>
        </div>
      )}

      {/* Financial Info: Offer amount & Commission */}
      {(model.offerAmount !== undefined || model.commission) && (
        <div className="pt-2 border-t border-line flex items-center justify-between gap-3 text-xs flex-wrap">
          {model.offerAmount !== undefined && (
            <div className="flex items-center gap-1 text-ink-soft">
              <span className="text-ink-muted">Offer:</span>
              <span className="font-semibold text-ink tabular-nums">
                {formatCurrency(model.offerAmount)}
              </span>
            </div>
          )}
          {model.commission && (
            <div className="flex items-center gap-1 text-ink-soft ml-auto">
              <span className="text-ink-muted">Commission:</span>
              <span className="font-semibold text-ink tabular-nums">
                {formatCurrency(model.commission.amount)}
                {model.commission.rate && (
                  <span className="text-ink-muted font-normal ml-1">
                    ({(model.commission.rate * 100).toFixed(1)}%)
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Last Message Preview */}
      {model.lastMessage && (
        <div className="pt-2 border-t border-line space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-medium text-ink-soft">Latest message</span>
            <span className="font-mono text-xs tabular-nums text-ink-muted">
              {model.lastMessage.relativeTime}
            </span>
          </div>
          <p className="text-xs text-ink leading-relaxed break-words line-clamp-2">
            <strong className="font-semibold text-ink">{model.lastMessage.senderFirstName}:</strong>{' '}
            {model.lastMessage.preview}
          </p>
        </div>
      )}

      {/* Participants Footer */}
      <div className="pt-2 border-t border-line flex items-center justify-between gap-2">
        <span className="text-xs text-ink-muted">Team & participants</span>
        <div aria-label={`Participants: ${participantNames}`}>
          <AvatarStack>
            {model.participants.map((p) => (
              <Avatar
                key={p.id}
                role={p.role}
                name={p.name}
                initials={p.initials}
                size="sm"
              />
            ))}
          </AvatarStack>
        </div>
      </div>
    </Link>
  );
}

export default DealCard;
