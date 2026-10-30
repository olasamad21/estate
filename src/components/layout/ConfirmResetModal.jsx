import { useApp } from '../../context/AppContext.jsx';
import { useDeals } from '../../context/DealContext.jsx';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { useToast } from '../common/useToast.js';
import { getDemoResetMessage } from '../../utils/messages.js';

export function ConfirmResetModal({ isOpen, onClose }) {
  const { resetDemo } = useApp();
  const { resetDealState } = useDeals();
  const { showToast } = useToast();

  const handleConfirm = () => {
    resetDemo();
    resetDealState();
    showToast(getDemoResetMessage(), 'info');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Prototype Demo"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Reset Demo
          </Button>
        </>
      }
    >
      <div className="space-y-2 text-xs leading-relaxed text-ink-soft">
        <p>
          Are you sure you want to reset the prototype to its default state?
        </p>
        <p>
          This will restore all sample deals, messages, alerts, documents, and clear any recorded feedback.
        </p>
      </div>
    </Modal>
  );
}

export default ConfirmResetModal;
