---
name: biomeg-consistency-check
description: Find and fix contradictions, stale statements, broken links, and privacy problems across the BIOMEG documentation. Use whenever someone asks to review, audit, verify, clean up, or check the docs, asks whether pages agree, says to "fix inconsistencies", or after a large documentation change.
---

# Check BIOMEG documentation for consistency

The layers are allowed to differ, so most apparent conflicts are not defects. A page saying what the old program did can correctly disagree with a page saying what the new one does. The value of this check depends on telling those apart.

## Steps

1. **Set the scope.** Use what was asked, or default to `docs/product/`, `docs/brand/`, and `docs/README.md`. Read the pages in full, because a search only finds the wording you expected. Say what you read fully and what you only searched.

2. **Protect the current state** before fixing anything. Check with `git status` that earlier work is committed, so that each change can be seen and undone. The repository is public, so never commit patient data or a backup archive.

3. **Look for these problems:**

   | Type | Example |
   |---|---|
   | Rule contradiction | A catalog actor differs from the permission matrix |
   | Gesture mismatch | A page says confirm, and the matrix says `S` |
   | State or term drift | A status or event name not in `docs/product/06-access-control.md` |
   | Page contradicting itself | Two sections of one page disagree |
   | Stale statement | A claim older than a later capture |
   | Broken link | A relative link with no target |
   | **Privacy** | A patient's name, document, age, or phone, including in a URL or file name |
   | Unlabeled claim | A design rule stated as an observed fact |

4. **Decide whether it's a real conflict:**

   | Pages | Verdict |
   |---|---|
   | Evidence versus `product/` or `brand/` | Not a defect. They answer different questions |
   | `product/` versus `brand/` on behavior | Defect. `product/` wins |
   | Anything versus `product/06-access-control.md` on who may act | Defect. That page wins |
   | `product/02-client-flow.md` versus `product/04-edges.md` | Defect. The edge page wins |
   | `brand/` versus anything on color, type, or layout | Defect. `brand/` wins |
   | Evidence versus `session/` on a 30 October screen | Stale evidence. `session/` wins |
   | `docs/access-control-plan.md` sections 3 to 11 versus current rules | Not a defect. It's a record |
   | Evidence pages against each other | Report it, and don't choose a winner without a source |

5. **Verify before trusting a finding.** Open both cited lines and confirm the quote, especially when a finding came from a helper agent.

6. **Fix what the rules settle.** Edit the losing page to match the winner, and search for the same wording elsewhere. Check every edit before writing, so a failed match doesn't leave the set half done.

7. **Report what the rules don't settle.** If no page wins, or a fix would create a new rule, don't quietly choose. Propose an answer, say who should confirm it, and record it in Decisions when it's an access rule.

8. **Handle privacy findings carefully.** Report the file and line, not the personal data. Don't print it in your output, even while checking it. Ask before changing evidence source links, because removing one can lose the citation.

9. **Check the links again** from the project folder, then re-read the changed lines. No output means no broken links:

   ```bash
   python3 -I - <<'EOF'
   import re, os
   for root, _, files in os.walk('docs'):
       for f in files:
           if f.endswith('.md'):
               path = os.path.join(root, f)
               for link in re.findall(r'\]\(([^)\s]+)\)', open(path, encoding='utf-8').read()):
                   if not link.startswith(('http', 'mailto', '#')):
                       if not os.path.exists(os.path.normpath(os.path.join(root, link.split('#')[0]))):
                           print(path, '->', link)
   EOF
   ```

10. **Update the list.** Remove fixed items from `docs/workspace-guide.md` section 9, and add anything left open.

## Known traps

- "Observed" has different meanings in `brand/` and in the evidence folders. Don't flag that difference alone.
- A page can be correct about a vendor's public material while `session/` shows more. "Not published" doesn't mean "does not exist".
- Files can change during a long task, so re-check a file before editing if your read is old.

## Report format

```markdown
## Result
[One line: how many defects were found and fixed, and how many are open.]

## Fixed
| File | Was | Now | Why this page lost |

## Needs a decision
| Issue | Pages | Recommendation | Who decides |

## Coverage
[What was read in full, what was only searched, and what was not checked.]
```

State plainly when nothing was found, and what that covers.
