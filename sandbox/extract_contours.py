import os
import json

import numpy as np
import matplotlib.pyplot as plt
import svgwrite

from skimage import measure
from skimage.io import imread, imsave
from skimage.color import rgb2gray
from skimage.morphology import *
from skimage.transform import resize as resize_image
from skimage.filters import gaussian, threshold_minimum, threshold_mean

from shapely.geometry import mapping, Polygon, MultiPolygon

from sandbox.settings import DATA_DIR


def process_image(image, crop, threshold):

    # crop and resize image
    rimage = crop_resize_image(image, crop)

    # threshold image
    timage = threshold_image(rimage, threshold)

    # extract contours
    contours = extract_contours(timage)

    # remove small contours (80 seems to be a good number)
    contours = filter(lambda x: len(x) > 80, contours)

    # convert contours to shapely polygons
    o = []
    for idx, c in enumerate(contours):
        polygon = Polygon(c)
        p = polygon.simplify(0.5, preserve_topology=True)
        o.append(p)

    # merge shapes by subtracting holes from larger shapes, etc.
    out_shapes = merge_shapes(o)
    return out_shapes


def get_image(fname):
    return rgb2gray(imread(fname))


def get_gif_stack():
    landfill_gif = os.path.join(DATA_DIR, 'sequ_ani.gif')
    return get_image(landfill_gif)


def get_threshold(image):
    threshold = threshold_minimum(image)

    return threshold


def to_json(shapes, fname):
    out = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": { "layer": 5, "region": "logan_airport" },
                "geometry": mapping(shapes[0])
            }
        ]
    }
    json.dump(out, open(fname, 'w'))


def save_image(fname, image):
    imsave(fname, image)


def crop_resize_image(image, crop, resize=1000):
    image = image[:crop[0], :crop[1]]
    image = resize_image(image, (resize, resize))
    return image


def threshold_image(image, threshold):
    # image = gaussian(image, 3)
    binary = (image > threshold).astype(int)
    # binary = binary_dilation(binary)

    return binary


def extract_contours(image, padding=10):
    shape = image.shape
    nimage = np.zeros((shape[0]+2*padding,shape[1]+2*padding))
    nimage[padding:shape[0]+padding,padding:shape[1]+padding] = image
    contours = measure.find_contours(nimage, 0)

    return contours


def merge_shapes(shapes):
    master = {}

    merged = []

    n_shapes = len(shapes)

    for idx in range(n_shapes):
        if idx in merged:
            continue

        master[idx] = []
        for jdx in range(n_shapes):
            if idx == jdx:
                continue

            if shapes[idx].contains(shapes[jdx]):
                merged.append(jdx)
                master[idx].append(jdx)


    out_shapes = []
    for k,v in master.iteritems():
        m = shapes[k]
        for c in v:
            m = m.difference(shapes[c])

        #HACK: if output is a MultiPolygon for some reason, just pick the first
        if type(m) == MultiPolygon:
            out_shapes.append(m.geoms[0])
        else:
            out_shapes.append(m)

    return out_shapes


def imshow(image):
    fig, ax = plt.subplots()
    ax.imshow(image, interpolation='nearest')

    ax.axis('image')
    # ax.set_xticks([])
    # ax.set_yticks([])
    plt.show()


def plot_contours(contours):
    for n, contour in enumerate(contours):
        plt.plot(contour[:, 1], contour[:, 0], linewidth=2)


def contour2path(contour):
    P = [['M', int(contour[0][1]), int(contour[0][0])]] + [['L', int(x[1]), int(x[0])] for x in contour[1:]]

    path = svgwrite.path.Path()
    [path.push(*x) for x in P]
    return path


def shape2svgpath(shape):
    path = svgwrite.path.Path()
    ext_points = list(shape.exterior.coords)

    P = [['M', int(ext_points[0][1]), int(ext_points[0][0])]] + [['L', int(x[1]), int(x[0])] for x in ext_points[1:]] + [['Z']]
    [path.push(*x) for x in P]

    for interior in shape.interiors:
        int_points = list(interior.coords)

        P = [['M', int(int_points[0][1]), int(int_points[0][0])]] + [['L', int(x[1]), int(x[0])] for x in int_points[1:]] + [['Z']]
        [path.push(*x) for x in P]

    return path


def to_svg(fname, shapes):
    dwg = svgwrite.Drawing(filename=fname, debug=True)

    for shape in shapes:
        path = shape2svgpath(shape)
        dwg.add(path)

    dwg.save()


def to_svg2(fname, layers):

    # created using: https://gka.github.io/palettes/#colors=lightyellow,orange,deeppink,darkred|steps=7|bez=1|coL=1
    colors = ['#ffffe0','#ffdaa3','#ffb27c','#fb8768','#eb5f5b','#d3394a','#b3152f','#ffffe0','#ffdaa3','#ffb27c','#fb8768','#eb5f5b','#d3394a','#b3152f','#8b0000']
    dwg = svgwrite.Drawing(filename=fname, debug=True)

    for idx,layer in enumerate(layers):
        color = colors[idx % len(colors)]
        group = svgwrite.container.Group(id='layer%i' % idx, fill=color)

        #TODO: all shapes should be MultiPolygons
        if type(layer) == Polygon:
            path = shape2svgpath(layer)
            group.add(path)
        else:
            for polygon in layer:
                path = shape2svgpath(polygon)
                group.add(path)



        dwg.add(group)
    dwg.save()
