import type { ReactNode } from "react";

/** Simple layout for text pages (about, privacy). */
export default function TextPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <article className="card mx-auto max-w-3xl p-8 md:p-12">
      <h1 className="text-3xl md:text-4xl">{title}</h1>
      {intro && <p className="mt-4 text-lg text-muted">{intro}</p>}
      <div className="mt-8 space-y-8 leading-relaxed [&_h2]:mb-2 [&_h2]:text-xl [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">{children}</div>
    </article>
  );
}
