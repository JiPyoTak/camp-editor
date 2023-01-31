import type { CampEditorOptions } from '@t/.';
import { ContentArea } from './ContentArea';
import { EditorController } from './EditorController';
import { Toolbar } from './Toolbar';

class EditorView {
  $root: HTMLElement;
  _toolbar: Toolbar;
  _contentArea: ContentArea;

  options: CampEditorOptions;

  controller: EditorController;

  constructor($root: HTMLElement, options: CampEditorOptions) {
    this.$root = $root;
    this.options = options;

    this.controller = new EditorController($root);
    this._toolbar = new Toolbar(options, this.controller);
    this._contentArea = new ContentArea(options, this.controller);
    this.$root.appendChild(this._toolbar.$element);
    this.$root.appendChild(this._contentArea.$element);
  }
}

export { EditorView };
