export type Category = {
  slug: string;
  title: string;
  description: string;
  cover: string;
  htmlFile?: string;
  showCaption?: boolean;
};

export type Registry = {
  categories: Category[];
};

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string) {
  return SLUG_PATTERN.test(slug);
}
