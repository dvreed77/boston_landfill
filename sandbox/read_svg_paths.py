from shapely.geometry import Polygon, MultiPolygon
from xml.dom import minidom, Node
from svg.path import parse_path as parse_svg_path

svg_doc = minidom.parse("data/svg_out.svg")


def parse_path(path):
    points = map(lambda x: (x.start.real, x.start.imag), parse_svg_path(path.getAttribute('d')))
    return points

def parse_polygon(polygon):
    points = polygon.getAttribute('points').strip().split(' ')
    points = filter(len, points)
    points = map(lambda x: map(float, x.split(',')), points)
    return points

def parse_group(group):
    # print('Layer %s' % group.getAttribute('id'))
    child_paths = filter(lambda x: x.nodeType == Node.ELEMENT_NODE, group.childNodes)

    polygons = []
    for c in child_paths:
        if c.nodeName == 'path':
            points = parse_path(c)
        elif c.nodeName == 'polygon':
            points = parse_polygon(c)
        else:
            print(c.nodeName)
            points = []

        polygons.append(Polygon(points))

    return MultiPolygon(polygons)

out = []
groups = svg_doc.getElementsByTagName("g")
for g in groups:
    out.append({
        'layer': path.getAttribute('id'),
        'shape': parse_group(g)
    })


paths = svg_doc.getElementsByTagName("path")
for path in paths:
    if path.hasAttribute('id'):
        out.append({
            'layer': path.getAttribute('id'),
            'shape': Polygon(parse_path(path))
        })

polygons = svg_doc.getElementsByTagName("polygon")
for polygon in polygons:
    if polygon.hasAttribute('id'):
        out.append({
            'layer': path.getAttribute('id'),
            'shape': Polygon(parse_polygon(polygon))
        })

out[0]['shape']
