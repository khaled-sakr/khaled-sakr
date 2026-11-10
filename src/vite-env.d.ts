/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web3Forms access key used by the contact form (optional; falls back to mailto). */
  readonly VITE_WEB3FORMS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
