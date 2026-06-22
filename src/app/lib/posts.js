import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

const postsDirectory = path.join(process.cwd(), "src", "content", "writing");

marked.use({
  renderer: {
    heading(token) {
      const text = this.parser.parseInline(token.tokens, this.parser.textRenderer);
      const html = this.parser.parseInline(token.tokens);

      return `<h${token.depth} id="${slugify(text)}">${html}</h${token.depth}>`;
    },
  },
});

export function getAllPosts() {
  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const post = getPostBySlug(slug);

      return {
        slug,
        title: post.title,
        description: post.description,
        date: post.date,
        order: post.order,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export function getPostBySlug(slug) {
  const filePath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const file = fs.readFileSync(filePath, "utf8");
  const { frontmatter, content } = parseFrontmatter(file);

  return {
    slug,
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    order: Number(frontmatter.order ?? 999),
    headings: getHeadings(content),
    html: renderMarkdown(content),
  };
}

function parseFrontmatter(file) {
  const match = file.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    return {
      frontmatter: {},
      content: file,
    };
  }

  const frontmatter = {};

  for (const line of match[1].split("\n")) {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    frontmatter[key] = value;
  }

  return {
    frontmatter,
    content: match[2].trim(),
  };
}

function renderMarkdown(markdown) {
  const normalized = normalizeCustomFormatting(markdown);
  const html = marked.parse(normalized, {
    gfm: true,
    breaks: false,
  });

  return wrapTables(html);
}

function normalizeCustomFormatting(markdown) {
  return markdown
    .replace(/<\*>\s*([\s\S]*?)\s*<\/\*>/g, "**$1**")
    .replace(/<_>\s*([\s\S]*?)\s*<\/_>/g, "*$1*");
}

function wrapTables(html) {
  return html
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>");
}

function getHeadings(markdown) {
  return normalizeCustomFormatting(markdown)
    .split("\n")
    .map((line) => line.match(/^##\s+(.+)$/))
    .filter(Boolean)
    .map((match) => ({
      text: stripMarkdownFormatting(match[1]),
      id: slugify(stripMarkdownFormatting(match[1])),
    }));
}

function stripMarkdownFormatting(value) {
  return value
    .replace(/<\*>\s*([\s\S]*?)\s*<\/\*>/g, "$1")
    .replace(/<_>\s*([\s\S]*?)\s*<\/_>/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1");
}

export function slugify(value) {
  return value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}
