import { createLocalImageStorage } from "@/backend/lib/storage/localImageStorage";

export * from "@/backend/lib/storage/imageContentType";

/**
 * ストレージ上での画像の位置を表すキー。
 * 例: "history-001/9f2c1a4e-....jpg"。先頭に "/" は付けない。
 */
export type ImageStorageKey = string;

/**
 * 画像の保存先の抽象。
 *
 * 開発環境ではローカルファイルシステム（public 配下）、本番環境ではクラウドの
 * オブジェクトストレージへ保存する想定のため、実装を差し替えられるようにしている。
 *
 * 画像はストレージが直接配信し、アプリケーションは経由しない。そのため保存だけでなく、
 * キーと参照パスの相互変換もストレージの責務としている。
 */
export interface ImageStorage {
  /**
   * キーを、フロントエンドがそのまま参照できるパスに変換する。
   * ローカルなら "/images/..." のような静的パス、オブジェクトストレージならURL。
   */
  toReferencePath(key: ImageStorageKey): string;

  /**
   * 参照パスをキーに戻す。
   * このストレージが管理していないパス（シードなどの既存データ）は null を返す。
   */
  toStorageKey(referencePath: string): ImageStorageKey | null;

  /**
   * 画像を保存する。既存のキーは上書きする。
   * contentType は、拡張子を持たないオブジェクトストレージ実装がメタデータとして
   * 保存するために受け取る。
   */
  save(key: ImageStorageKey, body: Buffer, contentType: string): Promise<void>;

  /** 画像を削除する。存在しない場合もエラーにしない。 */
  remove(key: ImageStorageKey): Promise<void>;
}

export const IMAGE_STORAGE_DRIVERS = {
  local: "local",
  object: "object",
} as const;

/**
 * 環境変数 IMAGE_STORAGE_DRIVER に応じた保存先を返す。未設定ならローカル。
 *
 * - local : IMAGE_STORAGE_LOCAL_DIR（既定は <cwd>/public/images）配下に保存し、
 *   IMAGE_STORAGE_BASE_PATH（既定は /images）を接頭辞とする静的パスで参照する
 * - object: クラウドのオブジェクトストレージ。接続先が未定のため未実装
 */
export function getImageStorage(): ImageStorage {
  const driver =
    process.env.IMAGE_STORAGE_DRIVER?.trim() || IMAGE_STORAGE_DRIVERS.local;

  switch (driver) {
    case IMAGE_STORAGE_DRIVERS.local:
      return createLocalImageStorage();

    case IMAGE_STORAGE_DRIVERS.object:
      // オブジェクトストレージの環境が整い次第、ここに実装を追加する。
      throw new Error(
        'IMAGE_STORAGE_DRIVER="object" の実装はまだありません。オブジェクトストレージの実装を追加してください。',
      );

    default:
      throw new Error(`IMAGE_STORAGE_DRIVER の値が不正です: ${driver}`);
  }
}
