"""Rebuild index.html from src/ (inlines the engine, card art and logo)."""
import base64, pathlib
root = pathlib.Path(__file__).parent
t = (root/'src/template.html').read_text()
logo = 'data:image/gif;base64,' + base64.b64encode((root/'docs/logo.gif').read_bytes()).decode()
t = (t.replace('/*LOGO*/', logo)
      .replace('/*ENGINE*/', (root/'src/engine.js').read_text())
      .replace('/*CARDS*/', (root/'src/cards.js').read_text()))
(root/'index.html').write_text(t)
print('index.html rebuilt')
