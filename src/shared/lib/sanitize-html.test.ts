import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sanitizeHtml } from "./sanitize-html";

describe("sanitizeHtml", () => {
  it("strips script, iframe, style tags and svg onload payloads", () => {
    const dirty = [
      '<p>Hello</p>',
      '<script>alert("xss")</script>',
      '<iframe src="https://evil.example/embed">fallback</iframe>',
      '<style>body { display: none !important; }</style>',
      '<svg onload="alert(1)"><circle cx="10" cy="10" r="5" /></svg>',
    ].join("");

    const clean = sanitizeHtml(dirty);
    assert.equal(clean, "<p>Hello</p>fallback");
    assert.equal(clean.includes("<script"), false);
    assert.equal(clean.includes("<iframe"), false);
    assert.equal(clean.includes("<style"), false);
    assert.equal(clean.includes("<svg"), false);
    assert.equal(clean.includes("onload"), false);
    assert.equal(clean.includes("display: none"), false);
  });

  it("strips on* event handlers and unsafe img sources", () => {
    const dirty = [
      '<img src="https://cdn.selldesk.com/size.png" alt="Guide" onerror="alert(1)" onclick="steal()" />',
      '<img src="x" onerror="alert(1)" />',
      '<img src="http://cdn.selldesk.com/insecure.png" alt="HTTP" />',
      '<img src="//evil.com/proto.png" alt="Proto" />',
      '<img src="data:image/svg+xml,<svg onload=alert(1)>" alt="Data" />',
      '<img src="/relative/image.png" alt="Rel" />',
      '<p onmouseover="alert(1)" style="color:red">Safe text</p>',
    ].join("");

    const clean = sanitizeHtml(dirty);
    assert.equal(
      clean,
      '<img src="https://cdn.selldesk.com/size.png" alt="Guide" /><p>Safe text</p>',
    );
    assert.equal(clean.includes("onerror"), false);
    assert.equal(clean.includes("onclick"), false);
    assert.equal(clean.includes("onmouseover"), false);
    assert.equal(clean.includes("style="), false);
    assert.equal(clean.includes("insecure.png"), false);
    assert.equal(clean.includes("proto.png"), false);
    assert.equal(clean.includes("relative/image.png"), false);
  });

  it("enforces http/https/mailto schemes and rel on links", () => {
    const dirty = [
      '<a href="https://example.com/chart" target="_blank" rel="opener">HTTPS</a>',
      '<a href="http://example.com/info">HTTP</a>',
      '<a href="mailto:help@example.com">Mail</a>',
      '<a href="javascript:alert(1)">JS</a>',
      '<a href="JaVaScRiPt:alert(1)">MixedJS</a>',
      '<a href="java&#x09;script:alert(1)">TabJS</a>',
      '<a href="data:text/html,<script>alert(1)</script>">Data</a>',
      '<a href="ftp://files.example.com/a">FTP</a>',
      '<a href="tel:+123456789">Tel</a>',
      '<a href="//evil.example.com">ProtoRel</a>',
    ].join("");

    const clean = sanitizeHtml(dirty);
    assert.match(
      clean,
      /<a href="https:\/\/example\.com\/chart" target="_blank" rel="noopener noreferrer nofollow">HTTPS<\/a>/,
    );
    assert.match(
      clean,
      /<a href="http:\/\/example\.com\/info" rel="noopener noreferrer nofollow">HTTP<\/a>/,
    );
    assert.match(
      clean,
      /<a href="mailto:help@example\.com" rel="noopener noreferrer nofollow">Mail<\/a>/,
    );
    assert.equal(clean.toLowerCase().includes("javascript:"), false);
    assert.equal(clean.toLowerCase().includes("data:"), false);
    assert.equal(clean.toLowerCase().includes("ftp:"), false);
    assert.equal(clean.toLowerCase().includes("tel:"), false);
    assert.equal(clean.includes("//evil.example.com"), false);
  });

  it("strips nested, obfuscated, and broken tag payloads", () => {
    assert.equal(
      sanitizeHtml("<p>Keep <img src=x onerror=alert(1)><script>alert(2)</script></p>"),
      "<p>Keep </p>",
    );

    const payloads = [
      "<<script>script>alert(1)<</script>/script>",
      "<scr<script>ipt>alert(1)</script>",
      "<p>Keep <img src=x onerror=alert(1)<script>alert(2)</script></p>",
      '<noscript><img src=x onerror=alert(1)></noscript>',
      '<math><mtext><table><mglyph><style><!--</style><img title="--><img src=1 onerror=alert(1)>">',
      '<a href="https://example.com" onclick="alert(1)"',
    ];

    for (const payload of payloads) {
      const clean = sanitizeHtml(payload);
      assert.equal(/<script/i.test(clean), false, `script leaked for: ${payload}`);
      assert.equal(/<iframe/i.test(clean), false, `iframe leaked for: ${payload}`);
      assert.equal(/<style/i.test(clean), false, `style leaked for: ${payload}`);
      assert.equal(/<img/i.test(clean), false, `unsafe img leaked for: ${payload}`);
      assert.equal(/onerror/i.test(clean), false, `onerror leaked for: ${payload}`);
      assert.equal(/onclick/i.test(clean), false, `onclick leaked for: ${payload}`);
    }
  });

  it("preserves legit allowlisted HTML tags and size-guide tables", () => {
    const legit = [
      "<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>",
      "<h4>Heading 4</h4><h5>Heading 5</h5><h6>Heading 6</h6>",
      '<p>Line 1<br /><strong>Bold</strong> and <em>Italic</em> <span>Note</span></p>',
      "<ul><li>Cotton</li></ul><ol><li>Step 1</li></ol>",
      '<table><thead><tr><th scope="col">Size</th><th scope="col">Chest</th></tr></thead><tbody><tr><td>M</td><td>38-40</td></tr></tbody></table>',
    ].join("");

    const clean = sanitizeHtml(legit);
    assert.equal(clean.includes("<h1>Heading 1</h1>"), true);
    assert.equal(clean.includes("<h6>Heading 6</h6>"), true);
    assert.equal(clean.includes("<strong>Bold</strong>"), true);
    assert.equal(clean.includes("<em>Italic</em>"), true);
    assert.equal(clean.includes("<span>Note</span>"), true);
    assert.equal(clean.includes("<ul><li>Cotton</li></ul>"), true);
    assert.equal(clean.includes("<ol><li>Step 1</li></ol>"), true);
    assert.equal(clean.includes("<table><thead><tr><th scope=\"col\">Size</th>"), true);
    assert.equal(clean.includes("<tbody><tr><td>M</td><td>38-40</td></tr></tbody></table>"), true);
  });
});
