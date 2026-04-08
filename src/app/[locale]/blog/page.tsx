import { getMessages, setRequestLocale } from "next-intl/server";
import type { Messages } from "@/lib/messages";
import { createPageMetadata } from "@/lib/seo-metadata";

type BlogPost = { title: string; date: string; body: string };

export const generateMetadata = createPageMetadata(
  "blog",
  (m) => m.blogPage.title,
  (m) => m.blogPage.lead,
);

export default async function BlogPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const messages = (await getMessages()) as Messages;
  const posts = messages.blogPage.posts as BlogPost[];

  return (
    <div className="prose prose-slate max-w-3xl space-y-8 dark:prose-invert">
      <div>
        <h1 className="text-slate-900 dark:text-white">{messages.blogPage.title}</h1>
        <p className="text-slate-700 dark:text-zinc-300">{messages.blogPage.lead}</p>
      </div>
      <ul className="list-none space-y-10 p-0">
        {posts.map((post, i) => (
          <li
            key={i}
            className="rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"
          >
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-500">
              {post.date}
            </p>
            <h2 className="mt-0 text-xl font-semibold text-slate-900 dark:text-white">
              {post.title}
            </h2>
            <div className="whitespace-pre-wrap text-slate-700 dark:text-zinc-300">
              {post.body}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
