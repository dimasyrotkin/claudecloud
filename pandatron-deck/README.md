# Pandatron: The Diagnose Conversation

Rebuilt sales deck, live and leave-behind versions.

- `AUDIT.md`: step 1 audit and claim verification
- `REPORT.md`: what changed, decisions, open questions, QA
- `output/`: PPTX, PDF and PNG deliverables
- `build/`: generator (python-pptx). Assets in `assets/`

Rebuild:

```bash
pip install python-pptx lxml
cd build && python3 build_deck.py && python3 build_design_system.py
```

PDFs were exported with LibreOffice Impress (`soffice --headless --convert-to pdf`).
