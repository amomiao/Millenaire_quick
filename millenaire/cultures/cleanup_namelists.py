import os
import re
import glob

root = os.getcwd()
files = glob.glob('*/namelists/*.txt')
print('files', len(files))
updated = 0
for f in files:
    path = os.path.join(root, f)
    with open(path, 'r', encoding='utf-8') as fh:
        text = fh.read()
    new = re.sub(r'[A-Za-zÀ-ÖØ-öø-ÿ]', '', text)
    new = new.replace('’', "'").replace('‘', "'")
    if new != text:
        with open(path, 'w', encoding='utf-8') as fh:
            fh.write(new)
        updated += 1
print('updated', updated)
