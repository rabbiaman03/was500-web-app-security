# WAS500 Lab 01 - Building First Web Pages with HTML & CSS
- **Author**: Rabbi Muhammad Aman
- **Date**: 2026-09-16
---
## Table of Contents
1. [Introduction](#introduction)
2. [VM Configuration Details](#vm-configuration-details)
3. [Command Outputs](#command-outputs)
4. [Screenshots](#screenshots)
5. [Experience and Challenges](#experience-and-challenges)
---
## Introduction
This lab report covers the work completed for WAS500 Lab 01. The lab had two parts:
•	Part A (Review): Observe how a web page is found and loaded by performing a DNS lookup (nslookup) for www.senecapolytechnic.ca and examining the client–server request/response cycle in the browser's Developer Tools Network tab.
•	Part B (Implementation & Debugging): Build my own web pages using ordered and unordered lists, link pages with relative paths, demonstrate the CSS box model, compare the three ways of applying CSS (external, internal and inline), and find and fix the defects in a broken HTML/CSS page using the W3C Validator and the browser.
---

---

## VM Configuration Details
- **Host Laptop Operating System**: Windows 11
- **Processor (CPU)**: Intel Core i7 8th Gen
- **System Memory (RAM)**: 16 GB
- **Storage**: 512 GB SSD

---
## Command Outputs

### Deliverable 1: DNS Domain Name Resolution (`nslookup`)
```bash
# Command executed
nslookup www.senecapolytechnic.ca

```bash
**Output**:
Server:         NHDS1.SeneDS.senecacollege.ca
Address:        10.101.100.21

Non-authoritative answer:
Name:           e190172.dscb.akamaiedge.net
Addresses:
                2600:1401:d000:16::17d3:8853
                2600:1401:d000:16::17d3:884f
                23.33.42.88
                23.33.42.69

Aliases:
                www.senecapolytechnic.ca
                www.senecapolytechnic.ca.edgekey.net
```

### What my computer asked for (2.3)

The computer asked a DNS server (10.101.100.21) to find the IP address of www.senecapolytechnic.ca. It returned 23.33.42.88 and 23.33.42.69. This happens before the browser can send a request because the browser needs the server’s IP address to know where to send the web request.

## Part A — Step 2: Request and Response
### Number of entries and what that means and request/response cycle explanation 
There are exactly 151 separate requests that appeared in the network list. This shows that a single web page is not just one file, but is actually made from dozens of individual components for example, HTML, scripts, stylesheets that must all be fetched separately. When the page was reloaded, my web browser (the client) sent an HTTP GET request over the network to Seneca Polytechnic's web server (the server). The server processed this request and sent back an HTTP response containing the initial HTML document. Finally, the client parsed this HTML document and automatically sent additional requests to the server to retrieve the remaining files needed to fully render the page.

## Part B — List justifications (2.16)

Why I chose < ol > vs < ul >: I used an ordered list ( < ol > ) for my learning steps because they follow a specific sequence for success, while I used an unordered list ( < ul > ) for my hobbies because they are just a collection of interests with no specific rank or order.

## Part B — Relative paths (2.19)
Why relative paths? Relative paths are the correct choice for linking between my own pages because they maintain the link connection regardless of where the folder is hosted.
## Part B — Box model (2.22)
Difference between padding and margin: On the element with the ID #box-model-demo, the padding (20px) creates space inside the border, pushing the text away from the edges, and the background color fills this entire area. The margin (30px) creates space outside the border, pushing other elements away, and the background color does not extend into the margin. This shows that the element technically ends at the outer edge of its border.
## Part B — Three ways to apply CSS (2.23–2.26)
Snippet 1 (External): ``` <link rel="stylesheet" href="styles.css"> ```

Snippet 2 (Internal): <style> body { background-color: yellow; } </style>

Snippet 3 (Inline): ``` <h1 style="color: green;">My Go-To Web Resources</h1> ```

Why external stylesheets are preferred: External stylesheets allow me to control the design of an entire website from a single file, making updates incredibly efficient. Using inline or internal styles on a twenty-page site, changing the primary brand color would require manually editing every single HTML file which will increase the risk of errors and inconsistencies. Additionally, it clutters the HTML files, making the structure harder to read and maintain.

## Part B — Debug table (2.28)
| Defect | Corrected Line | How I noticed it |
| :--- | :--- | :--- |
| `<title>` not closed | `<title>Broken Page</title>` | W3C Validator reported an unclosed element / whole page layout broke. |
| `<h1>` closed with `</h2>` | `<h1 class="page-heading">My Broken Page</h1>` | W3C Validator reported a mismatched closing tag. |
| `<img>` missing `alt` attribute | `<img src="images/photo.jpg" alt="A descriptive photo">` | W3C Validator reported a missing required attribute. |
| Missing closing quote on `href` | `<a href="resources.html">See my resources</a>` | W3C Validator reported an unclosed attribute. |
| Missing `.` for class selector | `.page-heading {` | The heading was not navy or centered in the browser. |
| British spelling of `color` | `color: navy;` | The heading remained the default black in the browser. |
| Missing colon in `font-size` | `font-size: 16px;` | The paragraph text size didn't change in the browser. |

## Screenshots 
### Network tab screenshot
<img width="978" height="882" alt="image" src="https://github.com/user-attachments/assets/6658845a-e01b-437a-a8a5-4347a21ae6d8" />
### Three ways to apply CSS
<img width="1240" height="520" alt="image" src="https://github.com/user-attachments/assets/ba02cf5b-7348-4d5b-843b-5aae0d07f093" />
### Validation of index.html
<img width="1290" height="820" alt="image" src="https://github.com/user-attachments/assets/36c8dc70-cff3-41b5-9122-3a35d564f7a9" />
### validation of resources.html 
<img width="1285" height="777" alt="image" src="https://github.com/user-attachments/assets/ad6eaac8-f49f-44c8-87da-b2e2fac4611c" />
index.html rendered page
<img width="1917" height="922" alt="image" src="https://github.com/user-attachments/assets/d67d6f5f-de2c-4773-b5b3-45db9c3ad7e9" />
<img width="1858" height="851" alt="image" src="https://github.com/user-attachments/assets/9dd2fbb4-64fa-40a1-89e5-f9e3e339b007" />
resources.html rendered page
<img width="1916" height="678" alt="image" src="https://github.com/user-attachments/assets/c397f8d9-b090-4d4e-93f4-6fdb0c4e6970" />

## Experience and Challenges
### Reflection on Completing the Lab
What did you learn?
Through this lab, I learned that a single webpage is not just one file, but a collection of many resources (HTML, CSS, images) that the browser fetches individually. I observed in the Network tab. I also learned how to properly structure HTML documents using semantic tags like < ol > and < ul >. I gained a clear visual understanding of the CSS box model—specifically how padding creates space inside an element's border while margin creates space outside of it.

What challenges did you face?
One of the main challenges I faced was during Step 8 when I added the temporary inline and internal CSS. At first, I couldn't see the garish yellow and green styles because I was only looking at the raw code on the GitHub website, which acts as a text editor rather than a web browser. I also had to figure out how to properly format a Markdown table for the debugging section of my report.

How did you solve them?
I solved the issue with the Markdown table by learning the proper syntax using pipes (|) and dashes (-) to structure the columns and rows. To solve the CSS rendering issue, I learned that I needed to download the raw HTML file from GitHub directly to my local computer. Once I opened that downloaded file in a standard web browser, it successfully translated the code into the visual webpage, allowing me to take the required screenshot.
