from shapely.geometry import Polygon, MultiPolygon
from xml.dom import minidom, Node
from svg.path import parse_path as parse_svg_path
from lxml import html
import lxml.etree as ET
from lxml import html

# svg_doc = minidom.parse("data/final_prep_out.svg")
# svg_doc = minidom.parse("data/svg_out_v2.svg")

# fname = "data/final_prep_out.svg"
fname = "data/svg_out_v2.svg"

svg = html.fromstring(open(fname, 'r').read())

layername = 'Logan Airport'

paths = svg.xpath("//g[@id='%s']//path" % layername.replace(' ', '_'))
polygons = svg.xpath("//g[@id='%s']//polygon" % layername.replace(' ', '_'))

paths[0].getAttribute('d')

parse_svg_path(paths[0].get('d'))

def parse_path(path):
    points = map(lambda x: (x.start.real, x.start.imag), parse_svg_path(path.get('d')))
    return points

def parse_polygon(polygon):
    points = polygon.get('points').strip().split(' ')
    points = filter(len, points)
    points = map(lambda x: map(float, x.split(',')), points)
    return points

def parse_group(group):
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

def parse_layer(layername):
    svg_paths = svg.xpath("//g[@id='%s']//path" % layername.replace(' ', '_'))
    svg_polygons = svg.xpath("//g[@id='%s']//polygon" % layername.replace(' ', '_'))

    polygons = []
    for path in svg_paths:
        points = parse_path(path)
        polygons.append(Polygon(points))

    for polygon in svg_polygons:
        points = parse_polygon(polygon)
        polygons.append(Polygon(points))

    return MultiPolygon(polygons)


def parse_element(el):
    if el.tag == 'polygon':
        points = parse_polygon(e)
        out = Polygon(points)

    elif el.tag == 'path':
        points = parse_path(e)
        out = Polygon(points)

    elif el.tag == 'g':
        polygons = []
        for el1 in el.xpath('.//*'):
            polygons.append(parse_element(el1))

        out = MultiPolygon(polygons)

    return out


def parse_layer2(layername):
    layername = layername.replace(' ', '_')
    elements = svg.xpath("//g[@id='%s']/*" % layername)

    zone = layername

    return elements
    print(elements[0]._Element)

    out = {
        'zone': zone,
        'layers': []
    }

    for e in elements:
        if e.tag == 'polygon':
            points = parse_polygon(e)
            out['layers'].append(Polygon(points))

        elif e.tag == 'path':
            points = parse_path(e)
            out['layers'].append(Polygon(points))

        elif e.tag == 'g':
            polygons = []
            for el in e.xpath('.//*'):
                if el.tag == 'polygon':
                    points = parse_polygon(e)
                    polygons.append(Polygon(points))

            elif el.tag == 'path':
                points = parse_path(e)
                polygons.append(Polygon(points))
    # svg_paths = svg.xpath("//g[@id='%s']//path" % layername.replace(' ', '_'))
    # svg_polygons = svg.xpath("//g[@id='%s']//polygon" % layername.replace(' ', '_'))
    #
    # polygons = []
    # for path in svg_paths:
    #     points = parse_path(path)
    #     polygons.append(Polygon(points))
    #
    # for polygon in svg_polygons:
    #     points = parse_polygon(polygon)
    #     polygons.append(Polygon(points))
    #
    # return MultiPolygon(polygons)

el = parse_layer2('Charlestown')

el[1].xpath('.//*')
h = el[0]
h.tag

h


def rename_layer(layer):
    layer = layer.replace('_x39_', '9')
    layer = layer.replace('_x38_', '8')
    layer = layer.replace('_x36_', '6')
    layer = layer.replace('_x35_', '5')
    layer = layer.replace('_x34_', '4')
    layer = layer.replace('_x33_', '3')
    layer = layer.replace('_x32_', '2')
    layer = layer.replace('_x31_', '1')
    return layer

Layers = [
    'Base',
    'West Cove',
    'Mill Pond',
    'South Cove',
    'East Cove',
    'South Boston',
    'South Bay',
    'Back Bay',
    'Charlestown',
    'Fenway',
    'East Boston',
    'Marine Park',
    'Columbus Park',
    'Logan Airport'
]

out = []
for layer in Layers:
    shape = parse_layer(layer)
    out.append({
        'zone': layer,
        'shape': shape
    })




from shapely.geometry import mapping
import json

def gen_feature(shape, properties):
    try:
        return {
            "type": "Feature",
            "properties": properties,
            "geometry": mapping(shape)
        }
    except Exception, e:
        print(e)
        return {}




feature = {
    "type": "FeatureCollection",
    "features": [gen_feature(x['shape'], {"layer": x['layer']}) for x in out]
}

for o in out:
    print(o['layer'])

out[40]

# json.dump(feature, open('data/out_v2.geojson', 'w'))

gen_feature(out[0]['shape'], {"zone": out[0]["zone"]})


# out = []
# groups = svg_doc.getElementsByTagName("g")
# for g in groups:
#     out.append({
#         'layer': rename_layer(g.getAttribute('id')),
#         'shape': parse_group(g)
#     })
#
#
# paths = svg_doc.getElementsByTagName("path")
# for path in paths:
#     if path.hasAttribute('id'):
#         out.append({
#             'layer': rename_layer(path.getAttribute('id')),
#             'shape': Polygon(parse_path(path))
#         })
#
# polygons = svg_doc.getElementsByTagName("polygon")
# for polygon in polygons:
#     if polygon.hasAttribute('id'):
#         out.append({
#             'layer': rename_layer(polygon.getAttribute('id')),
#             'shape': Polygon(parse_polygon(polygon))
#         })
