from sandbox.settings import DATA_DIR, CROP, THRESHOLD

from sandbox.extract_contours import *

gif_stack = get_gif_stack()

# Process all layers
layers = []
for image in gif_stack[:]:
    shapes = process_image(image, CROP, THRESHOLD)
    layers.append(shapes)


# Subtract subsequent layer from new layer
layers2 = []
for idx in range(1, len(layers)):
    l_tmp0 = [x.buffer(0.0) for x in layers[idx-1]]
    l_tmp1 = [x.buffer(0.0) for x in layers[idx]]

    mp = MultiPolygon(l_tmp1).difference(MultiPolygon(l_tmp0))
    layers2.append(mp)

areas = []

layers3 = [{
    'frame': 'base',
    'shape': MultiPolygon(layers[0])
    }]

for idx, l in enumerate(layers2):
    p = []
    if type(l) == MultiPolygon:
        for g in l.geoms:
            if g.area > 40:
                p.append(g)
            areas.append(g.area)
    else:
        if l.area > 40:
            p.append(l)
        areas.append(l.area)

    layers3.append({
        'frame': idx+1,
        'shape': MultiPolygon(p)
    })

layers3[0]['shape']
import re

svg_out = []
for l in layers3:
    colors = ['#ffffe0','#ffdaa3','#ffb27c','#fb8768','#eb5f5b','#d3394a','#b3152f','#ffffe0','#ffdaa3','#ffb27c','#fb8768','#eb5f5b','#d3394a','#b3152f','#8b0000']

    if l['frame'] == 'base':
        color = 'green'
    else:
        color = colors[l['frame'] % len(colors)]

    svg = l['shape'].svg()
    svg = re.sub('fill=".+?"', 'fill="{0}"'.format(color), svg)
    svg = re.sub('stroke=".+?"', 'stroke="None"', svg)

    svg = re.sub('^<g>', '<g id="%s">' % (l['frame']), svg)
    svg_out.append(svg)


s1 = ''.join(svg_out[::-1])
out = '<svg height="100%" width="100%">{0}</svg>'.format(s1)

with open('data/final_v2.svg', 'w') as fid:
    fid.write(out)

# to_svg2('data/final_temp.svg',  layers2[::-1] + [layers[0]])
