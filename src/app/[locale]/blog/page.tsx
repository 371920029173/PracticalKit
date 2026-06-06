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
    <div className="prose-page space-y-10">
      <header className="space-y-3 not-prose">
        <p className="section-kicker">{messages.blogPage.title}</p>
        <h1 className="section-title">{messages.blogPage.title}</h1>
        <p className="max-w-2xl text-lg text-slate-600 dark:text-zinc-400">
          {messages.blogPage.lead}
        </p>
      </header>
      <ul className="list-none space-y-8 p-0 not-prose">
        {posts.map((post, i) => (
          <li
            key={i}
            className="glass-panel rounded-2xl p-6 sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
              {post.date}
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              {post.title}
            </h2>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-zinc-300">
              {post.body}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
