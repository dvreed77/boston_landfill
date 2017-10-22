from shapely.geometry import Polygon, MultiPolygon
from svg.path import parse_path as parse_svg_path
from lxml import html
from shapely.geometry import mapping
import json

# fname = "data/final_prep_out.svg"
fname = "data/svg_out_v2.svg"

svg = html.fromstring(open(fname, 'r').read())

layername = 'Logan Airport'

paths = svg.xpath("//g[@id='%s']//path" % layername.replace(' ', '_'))
polygons = svg.xpath("//g[@id='%s']//polygon" % layername.replace(' ', '_'))

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
        points = parse_polygon(el)
        out = Polygon(points)

    elif el.tag == 'path':
        points = parse_path(el)
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

    out = {
        'zone': zone,
        'layers': []
    }

    for el in elements:
        l = parse_element(el)
        out['layers'].append(l)

    return out


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

layer_obj = parse_layer2('Base')

layer_obj['layers']

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

features = []
for layer in Layers:
    layer_obj = parse_layer2(layer)
    for idx, layer in enumerate(layer_obj['layers']):
        props = {
            "zone": layer_obj['zone'],
            "layer_id": idx
            }
        features.append(gen_feature(layer, props))

feature = {
    "type": "FeatureCollection",
    "features": features
}

json.dump(feature, open('data/out_v3.geojson', 'w'))
