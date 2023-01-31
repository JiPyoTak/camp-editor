import { defaultOptions } from '@/constants/option';
import { CampEditorOptions } from '@t/.';

// 지정하지 않은 옵션이 들어왔을때
export function getOptions(
  options: Partial<CampEditorOptions>,
): CampEditorOptions {
  // todo
  return {
    ...defaultOptions,
    ...options,
  };
}
