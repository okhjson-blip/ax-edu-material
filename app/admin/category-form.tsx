import { saveCategoryAction } from "@/app/admin/actions";

type Props = {
  previousSlug?: string;
  coverRequired?: boolean;
  defaultValues?: {
    slug: string;
    title: string;
    description: string;
    html: string;
  };
};

export function CategoryForm({
  previousSlug,
  coverRequired = true,
  defaultValues,
}: Props) {
  return (
    <form action={saveCategoryAction} className="mt-6 space-y-4">
      {previousSlug ? (
        <input type="hidden" name="previousSlug" value={previousSlug} />
      ) : null}
      <label className="block text-sm font-medium">
        슬러그 (URL)
        <input
          name="slug"
          required
          defaultValue={defaultValues?.slug}
          placeholder="sample-course"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm"
        />
      </label>
      <label className="block text-sm font-medium">
        제목
        <input
          name="title"
          required
          defaultValue={defaultValues?.title}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
        />
      </label>
      <label className="block text-sm font-medium">
        설명
        <textarea
          name="description"
          rows={2}
          defaultValue={defaultValues?.description}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
        />
      </label>
      <label className="block text-sm font-medium">
        커버 이미지
        <input
          type="file"
          name="cover"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          required={coverRequired}
          className="mt-1 w-full text-sm"
        />
      </label>
      <label className="block text-sm font-medium">
        HTML 본문
        <textarea
          name="html"
          required
          rows={18}
          defaultValue={defaultValues?.html}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm"
        />
      </label>
      <button
        type="submit"
        className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
      >
        저장
      </button>
    </form>
  );
}
