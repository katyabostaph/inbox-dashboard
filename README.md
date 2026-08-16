# Inbox

A small static page for watching the inbox get smaller.

Open `index.html`. That is the whole setup.

## Open locally

Double-click `index.html`, or from a terminal:

```bash
open index.html
```

On Linux: `xdg-open index.html`.

It is a `file://` page. Numbers live in `data.js` as `window.INBOX_STATS`. The page does not `fetch()` anything, so it works without a server.

A local server is optional, only if you want one later:

```bash
python3 -m http.server
```

Then open `http://localhost:8000`.

## How the numbers get here

The **Inbox Triage** agent refreshes `data.js` after tagging batches. It overwrites the `window.INBOX_STATS` object with the latest Gmail thread counts. Reload the page to see the new numbers.

A `read` on a category bar means the thread was opened in Gmail. That is the signal, not a guess.

## Feedback

Dashboard notes, layout requests, and "this number is wrong" go to the **Inbox Dashboard** agent. Not the triage chat. Triage is for labeling mail.

## Push to GitHub

From the inbox-dashboard folder, initialize a repo, add the three files, and commit.

    git init
    git add index.html data.js README.md
    git commit -m "Add inbox cleanup dashboard"

Then create a GitHub repo and push. With the GitHub CLI:

    gh repo create inbox-dashboard --public --source=. --remote=origin --push

Or by hand: add origin, rename the branch to main, and push upstream.

    git remote add origin https://github.com/YOUR_USER/inbox-dashboard.git
    git branch -M main
    git push -u origin main

No build step, no package manager. The three files are the project.
