export type NoteMeta = {
  expiration?: number;
  views?: number;
  extra?: Uint8Array;
};

export type ServerNote = {
  meta: NoteMeta;
  data: Uint8Array;
};

export type NoteContent =
  | { type: "text"; data: string }
  | { type: "files"; data: FileDTO[] };

export type FileDTO = {
  name: string;
  mime: string;
  size: number;
  data: Uint8Array;
};

export type Status = {
  version: string;
  max_size: number;
  max_views: number;
  max_expiration: number;
  allow_advanced: boolean;
  allow_files: boolean;
  imprint_url: string;
  imprint_html: string;
  theme_image: string;
  theme_text: string;
  theme_page_title: string;
  theme_favicon: string;
  theme_new_note_notice: boolean;
  theme_home_link: boolean;
};