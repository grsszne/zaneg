import fs from "node:fs";
import path from "node:path";

const postsDirectory = path.join(process.cwd(), "src", "content", "writing");

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
    html: markdownToHtml(content),
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

function markdownToHtml(markdown) {
  const blocks = markdown.split(/\n{2,}/);

  return blocks
    .map((block) => {
      const trimmed = block.trim();

      if (!trimmed) {
        return "";
      }

      const image = trimmed.match(/^!\[(.*?)\]\((\S+)(?:\s+"(.*?)")?\)$/);

      if (image) {
        const [, alt, src, caption] = image;

        return `<figure><img src="${src}" alt="${alt}" />${
          caption ? `<figcaption>${caption}</figcaption>` : ""
        }</figure>`;
      }

      if (trimmed.startsWith(">")) {
        const quote = trimmed
          .split("\n")
          .map((line) => line.replace(/^>\s?/, ""))
          .join("<br />");

        return `<blockquote><p>${formatInline(quote)}</p></blockquote>`;
      }

      if (isTable(trimmed)) {
        return tableToHtml(trimmed);
      }

      const heading = trimmed.match(/^(#{2,3})\s+(.+)$/);

      if (heading) {
        const level = heading[1].length;
        const text = heading[2].trim();

        return `<h${level} id="${slugify(text)}">${formatInline(text)}</h${level}>`;
      }

      return `<p>${formatInline(trimmed.replace(/\n/g, " "))}</p>`;
    })
    .join("\n");
}

function isTable(value) {
  const lines = value.split("\n");

  return (
    lines.length >= 2 &&
    lines[0].includes("|") &&
    /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[1])
  );
}

function tableToHtml(value) {
  const rows = value
    .split("\n")
    .filter((line) => line.trim())
    .map(parseTableRow);
  const [headers, , ...bodyRows] = rows;

  return `<div class="table-wrap"><table><thead><tr>${headers
    .map((cell) => `<th>${formatInline(cell)}</th>`)
    .join("")}</tr></thead><tbody>${bodyRows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${formatInline(cell)}</td>`).join("")}</tr>`
    )
    .join("")}</tbody></table></div>`;
}

function parseTableRow(value) {
  return value
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function getHeadings(markdown) {
  return markdown
    .split("\n")
    .map((line) => line.match(/^##\s+(.+)$/))
    .filter(Boolean)
    .map((match) => ({
      text: match[1],
      id: slugify(match[1]),
    }));
}

function formatInline(value) {
  return value
    .replace(/<\*>(.*?)<\/\*>/g, "<strong>$1</strong>")
    .replace(/<_>(.*?)<\/_>/g, "<em>$1</em>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.*?)\]\((https?:\/\/.*?)\)/g, '<a href="$2">$1</a>')
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
}

export function slugify(value) {
  return value.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}
