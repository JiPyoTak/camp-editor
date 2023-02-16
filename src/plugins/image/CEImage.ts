import { ImageResizer } from '@/plugins/image/ImageResizer';

interface Props {
  src: string | File;
  width: number;
  height: number;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  onResize?: () => void;
  onUploadBefore?: () => void;
  onUploadAfter?: () => void;
  $contentArea: HTMLElement;
}
class CEImage {
  $element: HTMLImageElement;
  width: number;
  height: number;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  onResize?: () => void;
  onUploadBefore?: () => void;
  onUploadAfter?: () => void;
  $resizer: ImageResizer | null = null;
  $contentArea: HTMLElement;

  constructor({
    src,
    height,
    width,
    onUploadBefore,
    onUploadAfter,
    onResizeStart,
    onResizeEnd,
    onResize,
    $contentArea,
  }: Props) {
    this.$contentArea = $contentArea;
    this.$element = document.createElement('img');
    this.$element.src =
      typeof src === 'string' ? src : URL.createObjectURL(src);
    this.width = width;
    this.height = height;
    this.onUploadBefore = onUploadBefore;
    this.onUploadAfter = onUploadAfter;
    this.onResizeStart = onResizeStart;
    this.onResizeEnd = onResizeEnd;
    this.onResize = onResize;
    this.$element.addEventListener('click', () => {
      if (this.$resizer) return;
      this.onFocus();
    });
    this.$element.addEventListener('blur', () => {
      this.onBlur();
    });
  }

  onFocus() {
    if (this.$resizer) return;
    this.$resizer = new ImageResizer({
      $contentArea: this.$contentArea,
      $image: this.$element,
      onResizeEnd: this.onResizeEnd,
      onResizeStart: this.onResizeStart,
      onResize: this.onResize,
    });
    this.$contentArea.appendChild(this.$resizer.$element);
  }

  onBlur() {
    if (this.$resizer?.$element) {
      this.$contentArea.removeChild(this.$resizer.$element);
      this.$resizer.destroy();
    }
    this.$resizer = null;
  }

  uploadBefore() {
    this.onUploadBefore?.();
  }

  uploadAfter() {
    this.onUploadAfter?.();
  }
}

export { CEImage };
