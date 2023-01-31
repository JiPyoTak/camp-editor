import { CampEditorOptions } from '@/types';

const defaultOptions: Pick<
  CampEditorOptions,
  'width' | 'height' | 'placeholder' | 'buttons'
> = {
  height: '300px',
  width: '500px',
  buttons: [
    ['bold', 'italic'],
    ['underline', 'strike'],
  ],
  placeholder: '내용을 입력하세요',
};

export { defaultOptions };
