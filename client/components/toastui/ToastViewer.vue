<template>
  <div ref="viewerElement"></div>
</template>

<script setup>
import Viewer from "@toast-ui/editor/dist/toastui-editor-viewer";
import katex from "katex";
import { onMounted, ref } from "vue";

import baseOptions from "./baseOptions.js";
import extendedAutolinks from "./extendedAutolinks.js";

const props = defineProps({
  initialValue: String,
});

const viewerElement = ref();

// Pandoc-ish inline/display math: $$...$$ or $...$ where the $ delimiter
// must hug non-whitespace on the inside, so prose like "it cost $5 and $10"
// is left alone.
const MATH_RE = /\$\$([\s\S]+?)\$\$|\$(?!\s)([^$\n]+?)(?<!\s)\$/g;
const SKIP_TAGS = new Set(["CODE", "PRE", "SCRIPT", "STYLE"]);

function renderInlineMath(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.includes("$")) return NodeFilter.FILTER_REJECT;
      for (let p = node.parentElement; p && p !== root; p = p.parentElement) {
        if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.classList?.contains("katex") || p.classList?.contains("katex-display"))
          return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const targets = [];
  for (let n; (n = walker.nextNode()); ) targets.push(n);

  for (const node of targets) {
    const text = node.nodeValue;
    MATH_RE.lastIndex = 0;
    let m;
    let lastIndex = 0;
    let frag = null;
    while ((m = MATH_RE.exec(text)) !== null) {
      frag ??= document.createDocumentFragment();
      if (m.index > lastIndex)
        frag.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
      const displayMode = m[1] !== undefined;
      const tex = m[1] ?? m[2];
      const wrap = document.createElement(displayMode ? "div" : "span");
      wrap.innerHTML = katex.renderToString(tex, {
        throwOnError: false,
        displayMode,
      });
      frag.appendChild(wrap);
      lastIndex = m.index + m[0].length;
    }
    if (frag) {
      if (lastIndex < text.length)
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      node.parentNode.replaceChild(frag, node);
    }
  }
}

onMounted(() => {
  new Viewer({
    ...baseOptions,
    extendedAutolinks,
    el: viewerElement.value,
    initialValue: props.initialValue,
  });
  renderInlineMath(viewerElement.value);
});
</script>

<style>
@import "@toast-ui/editor/dist/toastui-editor-viewer.css";
@import "prismjs/themes/prism.css";
@import "@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css";
@import "./toastui-editor-overrides.scss";
</style>
