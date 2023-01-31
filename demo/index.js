import { Editor } from '../dist/index.js';

const options = {
  buttons: [
    ['bold', 'italic'],
    ['strike', 'underline'],
  ],
};

new Editor('editor', options);
