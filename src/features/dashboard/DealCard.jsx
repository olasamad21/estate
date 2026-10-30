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
      {/* Row 1: Address and Unread Pill */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-ink group-hover:text-brand transition-colors break-words flex-1 min-w-0">
          {model.address}
        </h2>
        {model.unreadCount > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand text-surface shrink-0">
            <span aria-hidden="true">{model.unreadCount} new</span>
            <span className="sr-only">{model.unreadCount} unread messages</span>
          </span>
        )}
      </div>

      {/* Row 2: Stage Badge with Icon & Block Shape */}
      <div>
        <Badge
          variant={badgeVariant}
          icon={BadgeIcon}
          shape="block"
          className="gap-1.5 py-1"
        >
          <span className="break-words">{model.stageLabel}</span>
        </Badge>
      </div>

      {/* Row 3: Next Deadline (hidden for closed deals and deals without contingency) */}
      {model.nextDeadline && (
        <div
          className={`flex items-center gap-1.5 text-xs font-medium ${
            model.nextDeadline.urgent ? 'text-status-warning' : 'text-ink-muted'
          }`}
        >
          {model.nextDeadline.urgent && (
            <Clock className="w-3.5 h-3.5 shrink-0 text-current" aria-hidden="true" />
          )}
          <span className="break-words">
            {model.nextDeadline.title} {model.nextDeadline.label}
          </span>
        </div>
      )}

      {/* Row 4: Escrow Progress Bar Only (in_escrow only) */}
      {model.escrowProgress && (
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
      )}

      {/* Row 5: One Money Line ("{priceLabel} {amount}" and "Commission {amount} ({rate}%)") */}
      {(model.offerAmount !== undefined || model.commission) && (
        <div className="flex items-center justify-between gap-x-3 gap-y-1 text-xs flex-wrap">
          {model.offerAmount !== undefined && (
            <div className="flex items-center gap-1.5 text-ink-soft">
              <span className="text-ink-muted">{model.priceLabel}</span>
              <span className="font-semibold text-ink tabular-nums">
                {formatCurrency(model.offerAmount)}
              </span>
            </div>
          )}
          {model.commission && (
            <div className="flex items-center gap-1.5 text-ink-soft ml-auto">
              <span className="text-ink-muted">Commission</span>
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

      {/* Row 6: Last Message Preview (one border above message block only) */}
      {model.lastMessage && (
        <div className="pt-2.5 border-t border-line">
          <p className="text-xs text-ink leading-relaxed break-words line-clamp-2">
            <strong className="font-semibold text-ink">{model.lastMessage.senderFirstName}:</strong>{' '}
            {model.lastMessage.preview}
          </p>
        </div>
      )}

      {/* Row 7: Footer: Avatars on Left, Relative Time on Right */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div role="group" aria-label={`Participants: ${participantNames}`}>
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
        {model.lastMessage?.relativeTime && (
          <span className="text-xs tabular-nums text-ink-muted font-normal">
            {model.lastMessage.relativeTime}
          </span>
        )}
      </div>
    </Link>
  );
}

export default DealCard;
