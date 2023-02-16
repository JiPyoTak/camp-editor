import { COMMAND_INFO } from '@/constants/command';
import { CampCommand, CampEditorOptions, CampSubmenuCommand } from '@/types';
import { EditorController } from './EditorController';

// Toolbar 생성시 옵션을 검사하며 submenu가 존재하는 command는 submenu생성
// Toolbar는 생성된 submenu에 대한 정보를 알고 있다.
// controller 실행시 해당 정보를 controller에 넘겨주어야함
class Toolbar {
  $element: HTMLElement;
  options: CampEditorOptions;
  controller: EditorController;

  constructor(options: CampEditorOptions, controller: EditorController) {
    this.controller = controller;
    this.options = options;

    this.$element = document.createElement('div');
    this.$element.classList.add('ce-editor-toolbar');

    const $buttons = this.options.buttons.map(
      this.createButtonGroup.bind(this),
    );
    const $buttonWrapper = document.createElement('div');
    $buttonWrapper.classList.add('ce-editor-button-list');
    $buttonWrapper.append(...$buttons);

    const $submenus = this.createSubmenu(
      options.buttons as CampSubmenuCommand[][],
    );
    const $submenuWrapper = document.createElement('div');
    $submenuWrapper.classList.add('ce-editor-submenu-list');
    $submenuWrapper.append(...$submenus);

    this.$element.append($buttonWrapper);
    this.$element.append($submenuWrapper);
    this.initEventListener();
  }

  createButtonGroup(options: CampCommand[]) {
    const $element = document.createElement('div');
    $element.classList.add('ce-editor-box');

    const children = options.map(this.createButton.bind(this));
    $element.append(...children);

    return $element;
  }

  createButton(option: CampCommand) {
    const $element = document.createElement('button');
    $element.classList.add('ce-editor-btn');
    $element.setAttribute('data-command', option);

    if (!COMMAND_INFO[option]) {
      throw new Error('존재하지 않는 버튼 옵션입니다');
    }

    const { icon } = COMMAND_INFO[option];

    const $icon = document.createElement('img');
    $icon.src = icon;
    $element.appendChild($icon);

    return $element;
  }

  createSubmenu(options: CampSubmenuCommand[][]) {
    const $submenus: HTMLElement[] = [];

    const flatOptions = options.flat();

    for (let i = 0; i < flatOptions.length; i++) {
      const command = flatOptions[i];
      const commandInfo = COMMAND_INFO[command];

      if (commandInfo.sub) {
        const submenu = commandInfo.sub.$target;

        $submenus.push(submenu);
      }
    }

    return $submenus;
  }

  initEventListener() {
    this.$element.addEventListener('mousedown', (e: MouseEvent) => {
      const $targetButton = (e.target as HTMLElement).closest(
        '.ce-editor-btn',
      ) as HTMLElement;

      if (!$targetButton) return;

      const command = $targetButton.dataset.command as CampCommand;

      if (!command) return;

      this.controller.execCommand(command, e);

      e.preventDefault();
    });
  }
}

export { Toolbar };
