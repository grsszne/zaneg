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
        url: post.url,
        title: post.title,
        description: post.description,
        topics: post.topics,
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
  const html = renderMarkdown(content);

  return {
    slug,
    url: slug === "laser-sending-data-through-light" ? "/laser" : `/posts/${slug}`,
    title: frontmatter.title,
    description: frontmatter.description,
    topics: (frontmatter.tags ?? "").split(",").map(tag => tag.trim()).filter(Boolean),
    date: frontmatter.date,
    order: Number(frontmatter.order ?? 999),
    status: frontmatter.status,
    visual: frontmatter.visual,
    headings: getHeadings(content),
    html,
    blocks: renderContentBlocks(content, html),
  };
}

function renderContentBlocks(content, html) {
  const pattern = /<!--\s*(pcb|mechanical|checklist|benchmark):([\w-]+)\s*-->([\s\S]*?)<!--\s*\/\1\s*-->/g;
  const blocks = [];
  let position = 0;
  for (const match of content.matchAll(pattern)) {
    const preceding = content.slice(position, match.index).trim();
    if (preceding) blocks.push({ type: "markdown", html: renderMarkdown(preceding) });
    if (match[1] === "checklist") {
      blocks.push({ type: "checklist", id: match[2], stages: parseChecklist(match[3]) });
    } else {
      blocks.push({ type: match[1], model: match[2], html: renderMarkdown(match[3].trim()) });
    }
    position = match.index + match[0].length;
  }
  if (!blocks.length) return [{ type: "markdown", html }];
  const remaining = content.slice(position).trim();
  if (remaining) blocks.push({ type: "markdown", html: renderMarkdown(remaining) });
  return blocks;
}

function parseChecklist(markdown) {
  const stages = [];
  for (const token of marked.lexer(markdown)) {
    if (token.type === "heading") {
      stages.push({ title: token.text.replace(/^\d+\.\s*/, ""), items: [], notes: "" });
    } else if (stages.length) {
      const stage = stages[stages.length - 1];
      if (token.type === "list") {
        for (const item of token.items) {
          if (!item.task) continue;
          const widget = item.text.match(/<!--\s*explore:(tx|rx|cdr)\s*-->/)?.[1];
          const text = item.text.replace(/<!--\s*explore:(tx|rx|cdr)\s*-->/g, "").trim();
          stage.items.push({
            id: `${stage.title}/${text}`,
            checked: Boolean(item.checked),
            html: marked.parseInline(text),
            ...(widget ? { widget } : {}),
          });
        }
      } else if (token.type !== "space") {
        stage.notes += renderMarkdown(token.raw);
      }
    }
  }
  return stages;
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
