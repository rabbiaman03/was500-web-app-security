<div align="center">

# 🌐 WAS500 — Web Application Security

**Building the *Cipher Legends* site lab by lab, with a web-security lesson at each step**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Accessibility](https://img.shields.io/badge/a11y-keyboard_audited-success)

**[▶ Live demo](https://rabbiaman03.github.io/was500-web-app-security/)**

</div>

---

## 📌 Overview

Coursework from **WAS500 (Fall 2026, Seneca Polytechnic)**. Each lab extends **Cipher Legends**, a responsive gallery of cryptography and computer-security pioneers, and teaches a security concept along the way. Every lab folder has the full source code and a written report with screenshots.

## 🔬 Labs

| # | Lab | Security angle | Report | Demo |
|---|---|---|---|---|
| 01 | HTML and CSS fundamentals, DNS and the HTTP request cycle | How a page is found and loaded; W3C validation | [Report](lab01/README.md) | [Open](https://rabbiaman03.github.io/was500-web-app-security/lab01/) |
| 02 | Semantic HTML5 and responsive, accessible layout | Accessibility: skip link, focus states, keyboard audit | [Report](lab02/README.md) | [Open](https://rabbiaman03.github.io/was500-web-app-security/lab02/) |
| 03 | JavaScript basics and interactivity | Type coercion, scope and hoisting pitfalls; debugging | [Report](lab03/README.md) | [Open](https://rabbiaman03.github.io/was500-web-app-security/lab03/) |
| 04 | DOM manipulation and events | **XSS:** script injection through `innerHTML` vs safe `textContent` | [Report](lab04/README.md) | [Open](https://rabbiaman03.github.io/was500-web-app-security/lab04/) |
| 05 | Client-side validation and UX | **Bypassing HTML5 validation in DevTools**: why the server must always validate | [Report](lab05/README.md) | [Open](https://rabbiaman03.github.io/was500-web-app-security/lab05/) |

## 🖼️ Screenshots

| Responsive layout (1280 px) | `innerHTML` injection | Validation bypass |
|---|---|---|
| <img src="lab02/images/1280px.png" width="280"> | <img src="lab04/images/05-innerhtml.png" width="280"> | <img src="lab05/images/a2-bypassed.png" width="280"> |

## 🔑 Key takeaways

- **Never trust the client.** `required`, `minlength` and `type="email"` can be deleted in DevTools in seconds, so validation must be repeated on the server.
- **Prefer `textContent` over `innerHTML`** for untrusted data. `innerHTML` parses markup and allows injected event-handler scripts to run.
- **Accessibility is part of quality:** semantic landmarks, visible focus styles and skip links.

## ▶️ Run locally

No build step. Open any `labXX/index.html` in a browser, or run:

```bash
python -m http.server 8000   # then visit http://localhost:8000/lab05/
```

---

<sub>Author: <b>Rabbi Muhammad Aman</b> · Academic coursework.</sub>
