/** 散歩写真として受け付ける画像形式と、ストレージ上で使う拡張子の対応。 */
export const IMAGE_CONTENT_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
} as const;

export type SupportedImageContentType = keyof typeof IMAGE_CONTENT_TYPES;

export function isSupportedImageContentType(
  value: string,
): value is SupportedImageContentType {
  return Object.hasOwn(IMAGE_CONTENT_TYPES, value);
}

export function imageExtensionOf(contentType: SupportedImageContentType): string {
  return IMAGE_CONTENT_TYPES[contentType];
}
