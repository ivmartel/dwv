---
name: dicom
description: "Use this skill for ANY question about the DICOM standard — its parts, data elements, IODs, SOP classes, transfer syntaxes, VRs, services, tags, conformance, DICOMweb, DIMSE, and everything else in PS3.x. This skill ensures answers come from the DICOM standard edition dwv targets (2024a), checked against the current edition, with proper citations and direct links to the relevant section. Trigger whenever the user asks about DICOM concepts, DICOM tags, DICOM parts, DICOM services, DICOM file format, or anything that would require consulting the standard. Never answer DICOM questions from general knowledge alone — always look up and cite the official source."
---

# DICOM Standard Skill

## Core Mandate

**All answers must be grounded in the DICOM standard 2024a edition — the edition dwv targets — and include a reference link.** dwv's tag dictionary (`src/dicom/dictionary.js`) is loaded from `dcmstdtojs/dist/assets/2024a/dicom_tags.json`, and the jsdoc links in `src/` point to `/medical/dicom/2024a/`. If that edition ever changes, update `EDITION` below to match.

**Then compare with the current (latest) edition** and report any significant change (see Step 3). Never rely solely on training-data knowledge — always provide a citation to the relevant part/section of the standard. If an answer cannot be verified against the standard, say so explicitly.

---

## Official Sources

### Primary: dicom.nema.org (HTML — preferred for deep links)

The two editions to use:

```
EDITION = 2024a
https://dicom.nema.org/medical/dicom/2024a/output/chtml/     # answer from this one
https://dicom.nema.org/medical/dicom/current/output/chtml/   # compare with this one
```

Parts are addressed as (`…` is either base URL above):

| Part | Topic | URL |
|------|-------|-----|
| PS3.1 | Introduction and Overview | `…/part01/PS3.1.html` |
| PS3.2 | Conformance | `…/part02/PS3.2.html` |
| PS3.3 | Information Object Definitions | `…/part03/PS3.3.html` |
| PS3.4 | Service Class Specifications | `…/part04/PS3.4.html` |
| PS3.5 | Data Structures and Encoding | `…/part05/PS3.5.html` |
| PS3.6 | Data Dictionary | `…/part06/PS3.6.html` |
| PS3.7 | Message Exchange | `…/part07/PS3.7.html` |
| PS3.8 | Network Communication Support | `…/part08/PS3.8.html` |
| PS3.10 | Media Storage and File Format | `…/part10/PS3.10.html` |
| PS3.11 | Media Storage Application Profiles | `…/part11/PS3.11.html` |
| PS3.12 | Storage Functions and Media Formats | `…/part12/PS3.12.html` |
| PS3.14 | Grayscale Standard Display Function | `…/part14/PS3.14.html` |
| PS3.15 | Security and System Management | `…/part15/PS3.15.html` |
| PS3.16 | Content Mapping Resource | `…/part16/PS3.16.html` |
| PS3.17 | Explanatory Information | `…/part17/PS3.17.html` |
| PS3.18 | Web Services (DICOMweb) | `…/part18/PS3.18.html` |
| PS3.19 | Application Hosting | `…/part19/PS3.19.html` |
| PS3.20 | Imaging Reports using HL7 CDA | `…/part20/PS3.20.html` |
| PS3.21 | Transformations and Encodings | `…/part21/PS3.21.html` |
| PS3.22 | Real-Time Communication | `…/part22/PS3.22.html` |

**Current edition landing page:** https://www.dicomstandard.org/current
(it gives the name of the current edition, e.g. `2025c`; use it when reporting the comparison).

### Secondary: DICOM Standard Browser (Innolitics)

Useful for navigating tags, IODs, and modules interactively. It follows the current edition only, so never use it as the source for a 2024a answer:
```
https://dicom.innolitics.com/ciods
```
Deep links for tags: `https://dicom.innolitics.com/ciods/<ciod>/<module>/<tag>`

---

## Answering Workflow

### Step 1 — Identify the relevant Part(s)

Map the question to one or more PS3.x parts using the table above. Common mappings:

- Data element / tag questions → **PS3.6** (Data Dictionary)
- IOD / module / attribute questions → **PS3.3**
- SOP Class / service behaviour → **PS3.4**
- Encoding, VR, transfer syntax → **PS3.5**
- File format / DICOM Part 10 file → **PS3.10**
- Network protocol / PDU / DIMSE → **PS3.7**, **PS3.8**
- DICOMweb (WADO-RS, STOW-RS, QIDO-RS) → **PS3.18**
- Security / TLS / de-identification → **PS3.15**
- Display / LUT → **PS3.14**
- Structured Reporting / templates → **PS3.16**, **PS3.17**

### Step 2 — Fetch the relevant section, in both editions

Use `WebFetch` to retrieve the relevant HTML section from `dicom.nema.org` in the **2024a** edition, then the same section in the **current** edition. When you know the chapter or section number, go directly to it:

```
https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.7.html#sect_C.7.1
https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.7.html#sect_C.7.1
```

If unsure of the exact URL, fetch the part's top-level HTML and navigate from there. Use `WebSearch` for queries like `site:dicom.nema.org <topic>` if needed; it often returns other dated editions (e.g. `/2018d/`, `/2024c/`): never use those, rewrite the URL to its `/2024a/` and `/current/` equivalents and fetch those instead.

Section numbers can move between editions. If the same path does not hold the same content in the current edition, find the matching section from the current part's table of contents (or a `WebSearch`), and say that it moved.

### Step 3 — Compare with the current edition

Compare the two fetched sections and report a change only when it is **significant**, meaning it could affect how dwv reads, writes or interprets data. For example:

- a tag, VR, VM, keyword or name that was added, changed or retired;
- a transfer syntax, SOP class, IOD, module or template that was added, changed or retired;
- an attribute's requirement type (1/1C/2/2C/3) or condition that changed;
- an enumerated or defined term list that gained, lost or changed values;
- a change in an encoding rule, a computation (LUTs, geometry...) or a service behaviour.

Ignore editorial changes: wording, typo fixes, renumbered notes or figures, added examples, new cross references.

When a significant change is present, add a **Changes since 2024a** section to the answer that describes it, cites the current-edition section and, when known, names the correction proposal (CP) or supplement that introduced it. When there is none, say so in one line ("No significant change in the current edition (<edition name>).").

### Step 4 — Answer and cite

- Ground **every factual claim** in what you retrieved from the 2024a edition; mark claims that come only from the current edition as such.
- At the end of every answer (or inline when appropriate), include a **References** section with:
  - The Part name and section/table number
  - A direct clickable link to `dicom.nema.org` for the 2024a section and, when a change is reported, the current one
- Use this format:

```
## References
- **PS3.X §Y.Z — Title of Section** (2024a)
  https://dicom.nema.org/medical/dicom/2024a/output/chtml/partXX/sect_Y.Z.html
- **PS3.X §Y.Z — Title of Section** (current)
  https://dicom.nema.org/medical/dicom/current/output/chtml/partXX/sect_Y.Z.html
```

- If you could not retrieve the standard to verify something, say: *"This is based on general DICOM knowledge and could not be verified against the 2024a standard. Please consult [PS3.X](link) directly."*

---

## Citation Format

### Inline citation (for specific claims)
> According to **PS3.5 §6.2** in the 2024a edition ([link](https://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/sect_6.2.html)), the Value Representation (VR) defines the data type and format of the Value(s) of a Data Element.

### End-of-answer blocks (always include)
```markdown
## Changes since 2024a
No significant change in the current edition (2025c).

## References
- **PS3.6 Table 6-1 — Registry of DICOM Data Elements** (2024a)
  https://dicom.nema.org/medical/dicom/2024a/output/chtml/part06/chapter_6.html
- **PS3.5 §6.2 — Value Representation (VR)** (2024a)
  https://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/sect_6.2.html
```

---

## Important Notes

- Only two editions are ever used: `/2024a/` (the answer) and `/current/` (the comparison). `/current/` always resolves to the latest edition; get its name from the landing page above.
- DICOM has no version numbers beyond editions. Do not say "DICOM 3.0" or "DICOM version X."
- For tag lookups, the tag notation is `(gggg,eeee)` in hex, e.g., `(0008,0060)` for Modality.
- Retired attributes/SOP classes should be flagged as such, including those retired after 2024a.
- If a topic spans multiple parts, cite all relevant ones.
