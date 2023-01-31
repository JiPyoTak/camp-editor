import { COMMAND_INFO } from '@/constants/command';
import { CampCommand, CampEditorOptions } from '@t/.';
import { EditorController } from './EditorController';

class Toolbar {
  $element: HTMLElement;
  options: CampEditorOptions;
  controller: EditorController;

  constructor(options: CampEditorOptions, controller: EditorController) {
    this.controller = controller;
    this.options = options;

    this.$element = document.createElement('div');
    this.$element.classList.add('ce-editor-toolbar');

    const $buttons = (this.options.buttons ?? []).map(
      this.createGroup.bind(this),
    );
    this.initEventListener();
    this.$element.append(...$buttons);
  }

  createGroup(options: CampCommand[]) {
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

  initEventListener() {
    this.$element.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();

      const $targetButton = (e.target as HTMLElement).closest(
        '.ce-editor-btn',
      ) as HTMLElement;

      if (!$targetButton) return;

      const command = $targetButton.dataset.command as CampCommand;

      if (!command) return;

      this.controller.execCommand(command);
    });
  }
}

export { Toolbar };
