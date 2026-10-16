"""Compile independent chapter downloads from the retained complete LaTeX source."""
from pathlib import Path
import hashlib
import json
import re
import shutil
import subprocess
import tempfile
import fitz

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'dist/assets/lecture.tex'
OUT = ROOT / 'dist/assets/chapters'
OUT.mkdir(parents=True, exist_ok=True)
source = SOURCE.read_text()
preamble = source.split(r'\begin{document}', 1)[0]
matches = list(re.finditer(r'\\chapter\{([^}]+)\}', source))
assert len(matches) == 5
guide_start = source.index(r'\chapter*{راهنمای استفاده از جزوه}')
guide_end = source.index(r'\tableofcontents', guide_start)
parts = [('راهنمای استفاده از جزوه', source[guide_start:guide_end])]
for i, match in enumerate(matches):
    end = matches[i+1].start() if i+1 < len(matches) else source.index(r'\end{document}')
    parts.append((match[1], source[match.start():end].replace(r'\appendix', '')))

exports = []
with tempfile.TemporaryDirectory(prefix='amaar-chapters-') as temp:
    build = Path(temp)
    for i, (title, body) in enumerate(parts):
        header = r'\chapter*{'+title+'}' if i == 0 else r'\chapter{'+title+'}'
        credit = (r'\begin{center}{\small\color{muted} استاد درس: دکتر سکینه دهقان'
                  r'\quad | \quad گردآورندهٔ جزوه: احسان شهبازی}\end{center}'+'\n')
        assert header in body
        body = body.replace(header, header+'\n'+credit, 1)
        counter = r'\appendix' if i == 5 else r'\setcounter{chapter}{'+str(max(0, i-1))+'}'
        document = (preamble+'\n'+r'\hypersetup{pdftitle={'+title+
                    r'},pdfauthor={دکتر سکینه دهقان؛ احسان شهبازی}}'+'\n'+
                    r'\begin{document}'+'\n'+counter+'\n'+body+'\n'+r'\end{document}'+'\n')
        filename = f'chapter-{i}'
        tex = OUT / (filename+'.tex')
        tex.write_text(document)
        for run in range(2):
            result = subprocess.run(['xelatex', '-no-shell-escape', '-interaction=nonstopmode',
                                     '-halt-on-error', '-output-directory='+str(build), str(tex)],
                                    cwd=OUT, capture_output=True, text=True)
            if result.returncode:
                raise RuntimeError(f'{filename} pass {run+1}:\n'+result.stdout[-3000:])
        pdf = OUT/(filename+'.pdf')
        shutil.copy2(build/(filename+'.pdf'), pdf)
        doc = fitz.open(pdf)
        assert len(doc) > 0 and doc.metadata['title'] == title
        assert all(len(page.get_text()) > 20 for page in doc)
        exports.append({'id': f'chapter-{i}', 'title': title, 'pages': len(doc),
                        'pdf': f'assets/chapters/{filename}.pdf',
                        'tex': f'assets/chapters/{filename}.tex',
                        'pdfBytes': pdf.stat().st_size})
        print(f'{filename}: {len(doc)} pages, standalone LaTeX compiled successfully', flush=True)
(OUT/'index.json').write_text(json.dumps(exports, ensure_ascii=False, indent=2))
(OUT/'source.sha256').write_text(hashlib.sha256(SOURCE.read_bytes()).hexdigest()+'\n')
print('Created 6 PDF and 6 standalone LaTeX downloads.')
