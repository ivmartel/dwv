# Script to check internal anchor links in a generated documentation
# Update the 'input_dir' variable to point to the documentation directory and then run this script.
# It will report any broken file references or missing anchors.

import re, os

# path to documentation directory
input_dir = '/dwv/build/doc/dwv/0.36.0'

anchor_links = {}
for filename in os.listdir(input_dir):
    if filename.endswith('.html'):
        with open(os.path.join(input_dir, filename), 'r', encoding='utf-8', errors='ignore') as f:
            matches = re.findall(r'href=\"(?!https?://)([^\"]*\.html)#([^\"]*)\"', f.read())
            for filepath, anchor in matches:
                link = f'{filepath.lstrip("./")}#{anchor}'
                anchor_root = filepath.lstrip("./")
                # If the link is just an anchor (e.g. #section1), treat it as referring to the current file
                if anchor_root == '':
                    anchor_root = filename
                # Skip auto-generated line anchors like #line123
                if not re.match(r'^line[0-9]*$', anchor):
                    anchor_links[link] = (anchor_root, anchor)

broken_files, broken_anchors, valid = [], [], 0
for link, (filepath, anchor) in sorted(anchor_links.items()):
    if not os.path.isfile(os.path.join(input_dir, filepath)):
        broken_files.append((link, 'FILE NOT FOUND'))
    elif f'id=\"{anchor}\"' not in open(os.path.join(input_dir, filepath), 'r', encoding='utf-8', errors='ignore').read():
        broken_anchors.append((link, 'ANCHOR NOT FOUND'))
    else:
        valid += 1

print(f'Found {len(anchor_links)} internal anchor links\n')
print(f'Broken files: {len(broken_files)}')
print(f'Broken anchors: {len(broken_anchors)}')
print(f'Valid: {valid}\n')

if broken_files:
    print('First 20 broken files:')
    for link, reason in broken_files[:20]:
        print(f'  {link}: {reason}')

if broken_anchors:
    print('First 30 broken anchors:')
    for link, reason in broken_anchors[:30]:
        print(f'  {link}: {reason}')

