#!/usr/bin/env python3
"""
Lightweight Notion-export -> blog-markdown migrator.

Reads a Notion "Markdown & CSV" export and produces clean blog posts:
  - layered filter keeps only substantial posts (drops menus, stubs, drafts, personal)
  - recovers embedded images into a per-slug folder and rewrites links IN PLACE
  - converts Notion property block -> Astro frontmatter

NON-DESTRUCTIVE: writes only to OUT (a staging dir outside the content repos).
Promotion into brain/astro is a separate, manual step after review.
"""

import hashlib
import os
import re
import shutil
import sys
from urllib.parse import unquote

# ---------------------------------------------------------------- config
SRC = "/Users/tk/Downloads/私人与共享-1/湛蓝与蔚蓝"
OUT = "/Users/tk/Desktop/notion-migration/staging"
BRAIN_BLOG = "/Users/tk/Desktop/brain/publish/blog"  # for dedup

INCLUDE_DRAFTS = False          # status: Draft
MIN_BODY_CHARS = 150            # non-whitespace chars of body to count as "a paragraph"

# Exclude personal / structural pages by title or category (case-insensitive, latin).
PERSONAL_RE = re.compile(
    r"绿卡|opt|h1b|f1|签证|visa|创业|时间线|个人|私人|身份|offer|示例文章|友链|关于|配置中心",
    re.IGNORECASE,
)

# dropped per user: music-sharing / test posts (no substantive content)
DROP_CATEGORIES = {"音乐"}
DROP_TITLES = {"一些笔记"}

IMG_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}
PROP_KEYS = {"status", "type", "date", "tags", "category"}
# path may contain one level of nested parens, e.g. ...pytorch(1)/image.png
IMG_MD_RE = re.compile(r"!\[([^\]]*)\]\(((?:[^()]|\([^()]*\))*)\)")
HEX32_RE = re.compile(r"\s*[0-9a-f]{32}$")

# ---------------------------------------------------------------- helpers
def strip_hash(name: str) -> str:
    """'Foo 32171a79...cf' -> 'Foo' (Notion appends a 32-hex page id)."""
    return HEX32_RE.sub("", name)


def parse_notion(text: str):
    """Return (title, props:dict, body:str)."""
    text = text.lstrip("﻿")
    lines = text.split("\n")
    i = 0
    while i < len(lines) and lines[i].strip() == "":
        i += 1
    title = ""
    if i < len(lines) and lines[i].startswith("# "):
        title = lines[i][2:].strip()
        i += 1
    while i < len(lines) and lines[i].strip() == "":
        i += 1
    props = {}
    while i < len(lines):
        m = re.match(r"^([A-Za-z][\w ]*):\s?(.*)$", lines[i])
        if m and m.group(1).strip().lower() in PROP_KEYS:
            props[m.group(1).strip().lower()] = m.group(2).strip()
            i += 1
        else:
            break
    while i < len(lines) and lines[i].strip() == "":
        i += 1
    body = "\n".join(lines[i:]).strip()
    return title, props, body


def slugify(title: str, used: set) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    base = re.sub(r"-{2,}", "-", base)
    if len(base) < 2:
        base = "post-" + hashlib.md5(title.encode()).hexdigest()[:8]
    slug, n = base, 2
    while slug in used:
        slug = f"{base}-{n}"
        n += 1
    used.add(slug)
    return slug


def sanitize_img_name(name: str, used: set) -> str:
    stem, ext = os.path.splitext(name)
    stem = re.sub(r"[^A-Za-z0-9._-]+", "-", stem).strip("-") or "img"
    out, n = f"{stem}{ext.lower()}", 2
    while out in used:
        out = f"{stem}-{n}{ext.lower()}"
        n += 1
    used.add(out)
    return out


def make_description(body: str) -> str:
    for raw in body.split("\n"):
        ln = raw.strip()
        if not ln or ln.startswith(("#", "!", "|", ">", "```", "-", "*")):
            continue
        ln = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", ln)  # unwrap links
        ln = re.sub(r"[*`_]", "", ln)
        if len(ln) >= 20:
            return ln[:157].rstrip() + ("…" if len(ln) > 157 else "")
    return ""


def recover_images(body: str, md_dir: str, slug: str):
    """Copy referenced local images into OUT/images/<slug> and rewrite links.
    Returns (new_body, n_recovered, missing:list)."""
    img_out = os.path.join(OUT, "images", slug)
    used_names, n, missing = set(), 0, []

    def repl(m):
        nonlocal n
        alt, link = m.group(1), m.group(2).strip()
        if link.startswith(("http://", "https://", "/")):
            return m.group(0)
        raw = link.split("#")[0].split("?")[0]
        src = None
        for cand in (unquote(raw), unquote(unquote(raw))):  # Notion double-encodes some names
            p = os.path.normpath(os.path.join(md_dir, cand))
            if os.path.isfile(p) and os.path.splitext(p)[1].lower() in IMG_EXT:
                src = p
                break
        if src is None:
            missing.append(unquote(raw))
            return m.group(0)
        os.makedirs(img_out, exist_ok=True)
        newname = sanitize_img_name(os.path.basename(src), used_names)
        shutil.copy2(src, os.path.join(img_out, newname))
        n += 1
        return f"![{alt}](/blog/{slug}/{newname})"

    return IMG_MD_RE.sub(repl, body), n, missing


# ---------------------------------------------------------------- main
def main():
    if not os.path.isdir(SRC):
        sys.exit(f"SRC not found: {SRC}")
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(os.path.join(OUT, "posts"), exist_ok=True)

    existing = set()
    if os.path.isdir(BRAIN_BLOG):
        for f in os.listdir(BRAIN_BLOG):
            if f.endswith(".md"):
                existing.add(f[:-3])

    md_files = []
    for root, _, files in os.walk(SRC):
        for f in files:
            if f.endswith(".md"):
                md_files.append(os.path.join(root, f))
    md_files.sort()

    counts = {k: 0 for k in (
        "total", "not_post", "draft", "invisible", "personal", "dropped",
        "no_date", "too_short", "dup", "included")}
    counts["total"] = len(md_files)
    used_slugs, included, excluded = set(), [], []

    for path in md_files:
        title, props, body = parse_notion(open(path, encoding="utf-8").read())
        title = title or strip_hash(os.path.basename(path)[:-3])
        cat = props.get("category", "")
        typ = props.get("type", "")
        status = props.get("status", "")

        def drop(reason):
            counts[reason] += 1
            excluded.append((reason, title, cat))

        if typ != "Post":
            drop("not_post"); continue
        if status == "Draft" and not INCLUDE_DRAFTS:
            drop("draft"); continue
        if status not in ("Published", "Draft"):
            drop("invisible"); continue
        if PERSONAL_RE.search(title) or PERSONAL_RE.search(cat):
            drop("personal"); continue
        if cat in DROP_CATEGORIES or title in DROP_TITLES:
            drop("dropped"); continue
        if len(re.sub(r"\s", "", body)) < MIN_BODY_CHARS:
            drop("too_short"); continue
        if not re.search(r"\d{4}/\d{1,2}/\d{1,2}", props.get("date", "")):
            drop("no_date"); continue

        slug = slugify(title, used_slugs)
        if slug in existing:
            counts["dup"] += 1
            excluded.append(("dup", title, cat)); continue

        new_body, n_img, missing = recover_images(body, os.path.dirname(path), slug)
        y, mo, d = re.search(r"(\d{4})/(\d{1,2})/(\d{1,2})", props["date"]).groups()
        date = f"{y}-{int(mo):02d}-{int(d):02d}"
        # preserve ALL author tags (md `tags:` prop) + category, deduped, order: category first
        seen, tags = set(), []
        for t in re.split(r"[,，]", cat) + re.split(r"[,，]", props.get("tags", "")):
            tl = t.strip().lower()
            if tl and tl not in seen:
                seen.add(tl); tags.append(tl)
        desc = make_description(new_body).replace('"', "'")
        fm = (
            "---\n"
            f'title: "{title.replace(chr(34), chr(39))}"\n'
            f"date: {date}\n"
            f'description: "{desc}"\n'
            f"tags: [{', '.join(tags)}]\n"
            "draft: false\n"
            "---\n\n"
        )
        open(os.path.join(OUT, "posts", f"{slug}.md"), "w", encoding="utf-8").write(fm + new_body + "\n")
        counts["included"] += 1
        included.append((slug, date, cat, n_img, len(missing), title))

    # ----- report
    print("\n=== EXCLUDED (by layer) ===")
    for k in ("not_post", "draft", "invisible", "personal", "dropped", "too_short", "no_date", "dup"):
        print(f"  {k:11}: {counts[k]}")
    print(f"\n=== INCLUDED: {counts['included']} / {counts['total']} md files ===")
    print(f"{'slug':40} {'date':11} {'cat':12} img miss  title")
    for slug, date, cat, n_img, miss, title in sorted(included, key=lambda x: x[1], reverse=True):
        print(f"{slug[:40]:40} {date:11} {cat[:12]:12} {n_img:3} {miss:4}  {title[:42]}")

    man = os.path.join(OUT, "MANIFEST.tsv")
    with open(man, "w", encoding="utf-8") as fh:
        fh.write("status\tslug\tdate\tcategory\timages\tmissing\ttitle\n")
        for slug, date, cat, n_img, miss, title in included:
            fh.write(f"INCLUDED\t{slug}\t{date}\t{cat}\t{n_img}\t{miss}\t{title}\n")
        for reason, title, cat in excluded:
            fh.write(f"EXCL:{reason}\t\t\t{cat}\t\t\t{title}\n")
    print(f"\nStaging: {OUT}/posts  +  {OUT}/images")
    print(f"Manifest: {man}")


if __name__ == "__main__":
    main()
