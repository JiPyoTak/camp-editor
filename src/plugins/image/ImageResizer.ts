interface Props {
  $contentArea: HTMLElement;
  $image: HTMLImageElement;
  onResizeStart?: () => void;
  onResize?: () => void;
  onResizeEnd?: () => void;
}

const SIDE_DOT_POS_ARR = ['t', 'l', 'r', 'b'] as const;
const CORNER_DOT_POS_ARR = ['tl', 'tr', 'bl', 'br'] as const;

type SideDotPos = (typeof SIDE_DOT_POS_ARR)[number];
type CornerDotPos = (typeof CORNER_DOT_POS_ARR)[number];

type DotPosition = SideDotPos | CornerDotPos;

const getOppositeDot = (dot: DotPosition): DotPosition => {
  switch (dot) {
    case 'tl':
      return 'br';
    case 't':
      return 'b';
    case 'tr':
      return 'bl';
    case 'l':
      return 'r';
    case 'r':
      return 'l';
    case 'bl':
      return 'tr';
    case 'b':
      return 't';
    case 'br':
      return 'tl';
  }
};

class ImageResizer {
  $contentArea: HTMLElement;
  $image: HTMLImageElement;
  $element!: HTMLElement;
  onResizeStart?: () => void;
  onResize?: () => void;
  onResizeEnd?: () => void;
  originalWidth!: number;
  originalHeight!: number;
  curWidth!: number;
  curHeight!: number;
  $targetDot!: HTMLElement;
  $oppositeDot!: HTMLElement;
  constructor({
    $contentArea,
    $image,
    onResize,
    onResizeStart,
    onResizeEnd,
  }: Props) {
    this.$contentArea = $contentArea;
    this.$image = $image;
    this.initResizer();
    this.initEvent();
    this.onResizeStart = onResizeStart;
    this.onResize = onResize;
    this.onResizeEnd = onResizeEnd;
  }

  viewChange() {
    const $image = this.$image;
    const top = $image.offsetTop,
      left = $image.offsetLeft;

    this.$element.style.top = top + 'px';
    this.$element.style.left = left + 'px';
    this.$element.style.width = $image.width + 'px';
    this.$element.style.height = $image.height + 'px';
  }

  initEvent() {
    window.addEventListener('resize', (e) => {
      e.stopPropagation();
      this.viewChange();
    });
    this.$element
      .querySelectorAll('.ce-image-resizer-container>span')
      .forEach(($dot) => {
        $dot.addEventListener('dragstart', (e) => {
          this.resizeStart(e);
        });
        $dot.addEventListener('drag', (e) => {
          this.resize(e as MouseEvent);
        });
        $dot.addEventListener('dragend', () => {
          this.resizeEnd();
        });
      });
  }

  initResizer() {
    const $image = this.$image;
    const $element = document.createElement('div');
    $element.style.display = 'inline-block';
    $element.classList.add('ce-image-resizer-container');

    const top = $image.offsetTop,
      left = $image.offsetLeft;

    $element.style.top = top + 'px';
    $element.style.left = left + 'px';
    $element.style.width = $image.width + 'px';
    $element.style.height = $image.height + 'px';

    for (const pos of ['tl', 't', 'tr', 'l', 'r', 'bl', 'b', 'br']) {
      const $dot = document.createElement('span');
      $dot.classList.add(pos);
      $element.appendChild($dot);
    }

    this.$element = $element;
  }
  resizeStart(e: Event) {
    // todo: 이미지
    // 사이즈를 보여주는 네모박스 생성
    this.onResizeStart?.();
    this.originalWidth = this.curWidth = this.$element.offsetWidth;
    this.originalHeight = this.curHeight = this.$element.offsetHeight;
    this.$targetDot = e.currentTarget as HTMLElement;
    const targetDotClass = this.$targetDot.classList[0];
    this.$oppositeDot = this.$element.querySelector(
      `.${getOppositeDot(targetDotClass as DotPosition)}`,
    ) as HTMLElement;
  }

  resize(e: MouseEvent) {
    // todo: 이미지 사이즈 조절기능
    // 마우스 pos에 따라서 네모박스의 조절
    this.onResize?.();

    const mouseX = e.clientX,
      mouseY = e.clientY;

    const targetDotPos = this.$targetDot.classList[0] as DotPosition;
    const oppositeDotOffset = this.$oppositeDot.getBoundingClientRect();

    if (SIDE_DOT_POS_ARR.includes(this.$targetDot.classList[0] as SideDotPos)) {
      switch (targetDotPos) {
        case 't':
          this.curHeight = oppositeDotOffset.bottom - mouseY;
          this.curWidth = this.originalWidth;
          break;
        case 'l':
          this.curWidth = oppositeDotOffset.right - mouseX;
          this.curHeight = this.originalHeight;
          break;
        case 'r':
          this.curWidth = mouseX - oppositeDotOffset.left;
          this.curHeight = this.originalHeight;
          break;
        case 'b':
          this.curHeight = mouseY - oppositeDotOffset.top;
          this.curWidth = this.originalWidth;
          break;
      }
    } else {
      switch (targetDotPos) {
        case 'tl':
          this.curWidth = oppositeDotOffset.right - mouseX;
          this.curHeight = oppositeDotOffset.bottom - mouseY;
          break;
        case 'tr':
          this.curWidth = mouseX - oppositeDotOffset.left;
          this.curHeight = oppositeDotOffset.bottom - mouseY;
          break;
        case 'bl':
          this.curWidth = oppositeDotOffset.right - mouseX;
          this.curHeight = mouseY - oppositeDotOffset.top;
          break;
        case 'br':
          this.curWidth = mouseX - oppositeDotOffset.left;
          this.curHeight = mouseY - oppositeDotOffset.top;
          break;
      }
    }

    this.$element.style.width = this.curWidth + 'px';
    this.$element.style.height = this.curHeight + 'px';
  }

  resizeEnd() {
    // todo: 이미지 style의 width, height를 네모박스의 사이즈로 변경
    this.onResizeEnd?.();

    if (this.$element.clientHeight <= 0 || this.$element.clientWidth <= 0) {
      return;
    }

    this.$image.style.width = this.$element.clientWidth + 'px';
    this.$image.style.height = this.$element.clientHeight + 'px';

    // setTimeout(() => this.initResizer.bind(this, this.$image), 1000);
    this.destroy();
    this.initResizer();
    this.initEvent();
    this.$contentArea.appendChild(this.$element);
  }

  destroy() {
    this.$element.remove();
  }
}

export { ImageResizer };
