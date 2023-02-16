import Submenu from './Submenu';

class TableSubmenu extends Submenu {
  row: number = 1;
  col: number = 1;
  // context: TableContext;
  inputList: HTMLInputElement[] = [];
  $picker: any;
  $highlighted: any;

  constructor() {
    super('table');

    const $tableSize = this.initTableSizePicker();
    const $tableSizeInputBox = this.initTableSizeInputBox();

    this.$target.append($tableSize, $tableSizeInputBox);
  }

  /**
   * @description row와 col을 변경하고 해당 값을 의존하고 있는 데이터들을 변경
   * @param row number
   * @param col number
   * @param changeType string | undefined
   * @returns void
   */
  changeRowAndCol(row: number, col: number, changeType?: string) {
    if (row < 0 || col < 0 || row > 10 || col > 10) return;

    this.row = row;
    this.col = col;

    if (changeType !== 'input') this.changeRowAndColByInput();
    if (changeType !== 'picker') this.changeRowAndColByPicker();
  }

  initTableSizePicker() {
    const $tableSize = document.createElement('div');
    $tableSize.classList.add('ce-table-size');

    const $picker = document.createElement('div');
    const $highlighted = document.createElement('div');
    const $unHighlighted = document.createElement('div');

    $picker.classList.add('ce-table-size-picker');
    $highlighted.classList.add('ce-table-size-highlighted');
    $unHighlighted.classList.add('ce-table-size-unhighlighted');

    $picker.addEventListener('mousemove', (e) => {
      e.stopPropagation();

      let row = Math.ceil(e.offsetX / 18);
      let col = Math.ceil(e.offsetY / 18);

      row = row < 1 ? 1 : row;
      col = col < 1 ? 1 : col;

      $highlighted.style.width = `${row}em`;
      $highlighted.style.height = `${col}em`;

      this.changeRowAndCol(row, col, 'picker');
    });

    $picker.addEventListener('click', (e) => {
      e.stopPropagation();

      console.log(this.row, this.col);
      this.createTable();
      this.close();
    });

    $tableSize.append($picker, $highlighted, $unHighlighted);

    return $tableSize;
  }

  initTableSizeInputBox() {
    const $tableSizeInputBox = document.createElement('div');
    $tableSizeInputBox.classList.add('ce-table-size-input-box');

    const $tableSizeInputByRow = document.createElement('input');
    const $tableSizeInputByCol = document.createElement('input');

    $tableSizeInputByRow.classList.add('ce-table-size-input');
    $tableSizeInputByCol.classList.add('ce-table-size-input');

    $tableSizeInputByRow.value = '1';
    $tableSizeInputByCol.value = '1';

    $tableSizeInputByRow.min = '1';
    $tableSizeInputByCol.min = '1';

    this.inputList.push($tableSizeInputByRow, $tableSizeInputByCol);

    $tableSizeInputBox.append($tableSizeInputByRow, 'x', $tableSizeInputByCol);
    $tableSizeInputBox.addEventListener('input', this.inputHandler.bind(this));

    return $tableSizeInputBox;
  }

  inputHandler(e: Event) {
    e.preventDefault();

    const $target = e.target as HTMLInputElement;
    $target.value = $target.value.replace(/[^0-9.]/g, '');

    if (Number($target.value) > 10) {
      $target.value = '10';
    }

    if (Number($target.value) < 0) {
      $target.value = '1';
    }

    const [$row, $col] = this.inputList;
    this.changeRowAndCol(parseInt($row.value), parseInt($col.value), 'input');
  }

  changeRowAndColByInput() {
    const [$row, $col] = this.inputList;

    $row.value = String(this.row);
    $col.value = String(this.col);
  }

  changeRowAndColByPicker() {}

  createTable() {
    const $textarea = this.$root?.querySelector('.ce-editor-content-area');
    const $table = document.createElement('table');
    const $tbody = document.createElement('tbody');

    for (let i = 0; i < this.row; i++) {
      const $tr = document.createElement('tr');

      for (let j = 0; j < this.col; j++) {
        const $td = document.createElement('td');
        $tr.append($td);
      }

      $tbody.append($tr);
    }

    $table.append($tbody);

    $textarea?.appendChild($table);
  }
}

export default TableSubmenu;
