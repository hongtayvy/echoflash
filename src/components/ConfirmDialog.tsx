import Modal from "./Modal";
import Button from "./Button";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  destructive,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      maxWidthClass="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={destructive ? "danger" : "primary"} onClick={onConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="text-sm text-zinc-700">{description}</div>
    </Modal>
  );
}
