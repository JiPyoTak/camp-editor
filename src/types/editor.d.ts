import { CampCommand } from './command';

interface CampEditorOptions {
  width: string;
  height: string;
  placeholder: string;
  buttons: CampCommand[][];
}

export type { CampEditorOptions };
