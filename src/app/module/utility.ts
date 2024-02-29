/**
 * Showing modal component
 * @param modalRef
 * @param show
 * @param canClose
 * @param setText
 * @param text
 */
export function showModal(
  modalRef: React.RefObject<any>,
  show: Boolean,
  canClose: boolean = false,
  setText?: React.SetStateAction<any>,
  text?: string,
): void {
  const modal = modalRef.current;

  if (show) {
    modal.showModal();
  } else {
    modal.close();
  }

  if (canClose) {
    modal.onclick = () => modal.close();
  } else {
    modal.onclick = () => null;
  }

  if (setText) {
    setText(text);
  }
}
