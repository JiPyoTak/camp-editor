import { CampCommand } from '@/types';

class Submenu {
  $root: HTMLElement | null = null;
  $target: HTMLElement;
  command: CampCommand;

  constructor(command: CampCommand) {
    this.command = command;
    this.$target = document.createElement('div');
    this.init();
  }

  // 옵션이 들어왔을때 옵션을 통한 초기화 작업 수행
  init() {
    const $target = this.$target;
    $target.classList.add('ce-editor-submenu');
  }

  setPosition(left: number, top: number) {
    this.$target.style.left = `${left}px`;
    this.$target.style.top = `${top}px`;
  }

  toggle() {
    const isNone = this.$target.style.display !== 'block';
    this.$target.style.display = isNone ? 'block' : 'none';
  }

  close() {
    this.$target.style.display = 'none';
  }

  initRoot($root: HTMLElement) {
    this.$root = $root;
  }
}

export default Submenu;
