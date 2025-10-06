// static/js/copy-code.js
(() => {
    // Replace your extractCodeText with this:
    function extractCodeText(preEl) {
        // Chroma with line-number table
        const lnTable = preEl.querySelector("table.lntable");
        if (lnTable) {
            const codeCell = lnTable.querySelector("td.lntd:last-child");
            if (codeCell) {
                const lineEls = codeCell.querySelectorAll("span.line");
                if (lineEls.length) {
                    return Array.from(lineEls, (l) => l.textContent).join("\n");
                }
                const codeEl = codeCell.querySelector("code");
                if (codeEl) return codeEl.textContent;
            }
        }

        // Regular <pre><code> (or Chroma without table)
        const codeEl = preEl.querySelector("code");
        if (codeEl) {
            const lineEls = codeEl.querySelectorAll("span.line");
            if (lineEls.length)
                return Array.from(lineEls, (l) => l.textContent).join("\n");
            return codeEl.textContent; // use textContent, not innerText
        }

        return "";
    }

    async function copyText(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (_) {}
        // Fallback for older browsers / http
        try {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.top = "-1000px";
            ta.setAttribute("readonly", "");
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            return true;
        } catch (_) {
            return false;
        }
    }

    function makeButton(preEl) {
        if (preEl.querySelector(".copy-button")) return; // don’t double-add

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "copy-button";
        btn.textContent = "Copy";
        btn.setAttribute("aria-label", "Copy code to clipboard");
        btn.title = "Copy";

        btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const original = btn.textContent;
            const text = extractCodeText(preEl)
                .replace(/\r\n/g, "\n")
                .replace(/\n$/, "");

            if (!text) {
                btn.textContent = "No code";
                setTimeout(() => (btn.textContent = original), 1200);
                return;
            }

            const ok = await copyText(text);
            btn.textContent = ok ? "Copied!" : "Failed";
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = original;
                btn.disabled = false;
            }, 500);
        });

        // Position inside <pre> so your .copy-button CSS (absolute) applies
        preEl.appendChild(btn);
    }

    function init() {
        // Only target <pre> that *actually* contain code
        const pres = document.querySelectorAll("pre");
        pres.forEach((pre) => {
            if (
                pre.querySelector("code") ||
                pre.querySelector("table.lntable")
            ) {
                // Ensure the container will position the absolute button correctly
                if (getComputedStyle(pre).position === "static") {
                    pre.style.position = "relative";
                }
                makeButton(pre);
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
