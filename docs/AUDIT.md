# Repository audit

Input: the uploaded 001_Public-main.zip snapshot, 946 files, 23 existing apps. The audit preserved all 38 Sankey source files and their file-list/hash fixture.

| Finding                                                              | Implemented correction                                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| App source in three locations and manual publication steps           | Canonical applications/<slug>/ discovery and one artifact/workflow.                  |
| Separate hand-maintained app links                                   | Generated website catalogue and README tables.                                       |
| Smaller app runtime depended on sibling shared folders               | Local runtime modules/assets inside each app folder.                                 |
| Growing whole-library offline precache                               | Isolated app cores and explicitly selected Math videos.                              |
| Worker configuration could need network on restart                   | Embed core manifest in compiled worker.                                              |
| Cached media needs seeking/ranges                                    | Normal/open-ended/suffix ranges and 416 rejection.                                   |
| Backup cap rejected valid larger app exports                         | Validated import limit raised to 16 MiB.                                             |
| Stale tabs could replace newer saved data                            | Detect conflicting browser records before writing and report reload/export recovery. |
| structuredClone unavailable in older browsers                        | JSON-compatible data cloning fallback.                                               |
| JSON.parse/stringify rounded big integers and removed duplicate keys | Token-preserving grammar/formatter.                                                  |
| Regex result could use text edited after submission                  | Capture the submitted pattern, flags and text snapshot.                              |
| Unit category change lost an unsubmitted value                       | Preserve input before category changes.                                              |
| Habit duplicate dates and yesterday's view                           | Count unique dates and refresh on local date changes/return.                         |
| Memory Lab lost focus on every card flip                             | Persistent board buttons and incremental updates.                                    |
| Native game vertical key skip moved sideways                         | Preserve column stride when skipping matched cards.                                  |
| Equivalent fractions compared different whole widths                 | Common whole width; corrected four narration variants.                               |
| Inverse function graph had unequal axes                              | Equal coordinate scales; corrected four narration variants.                          |
| Zero inequality coefficient and impossible combinations were clamped | Explicit all/no-solution case and true C(n,k)=0 for k>n.                             |
| Phone diagrams shrank labels too far                                 | Readable detail/pan view plus fit toggle.                                            |

The rebuild reuses correct cent arithmetic, unit factors, schemas, German/quiz content, QR encoding, mathematical data and native game state. Replacing those solely to increase the amount rewritten would risk regressions. The visible workspace, local runtime packaging and repository publication foundation have been redesigned.

Primary references consulted: [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [upload limits](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository), [MDN storage events](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event), [WebKit inline media policies](https://webkit.org/blog/6784/new-video-policies-for-ios/). These informed job permissions, manual upload guidance, stale-tab feedback and explicit inline playback. [Executed validation](VALIDATION.md) separates actual checks from pending devices.
