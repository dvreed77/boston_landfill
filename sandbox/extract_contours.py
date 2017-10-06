import os

import svgwrite
import numpy as np
import matplotlib.pyplot as plt
from skimage.io import imread, imsave
from skimage.color import rgb2gray
from skimage.filters import threshold_mean
import numpy as np
import matplotlib.pyplot as plt
from skimage import measure
from skimage.morphology import *
from skimage.transform import resize as resize_image
from skimage.filters import gaussian
from shapely.geometry import Polygon
from shapely.geometry import mapping
import json


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
    json.dump(out, open(os.path.join(DATA_DIR, 'test.geojson'), 'w'))

def get_image(fname):
    return rgb2gray(imread(fname))


def save_image(fname, image):
    imsave(fname, image)


def crop_resize_image(image, crop, resize=1000):
    image = image[:crop[0], :crop[1]]
    image = resize_image(image, (1000, 1000))
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
            # if shapes[c].is_valid:
            m = m.difference(shapes[c])
            # else:
            #     print('invalid shape')

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
        ax.plot(contour[:, 1], contour[:, 0], linewidth=2)


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
    dwg = svgwrite.Drawing(filename=fname, debug=True)

    for idx,layer in enumerate(layers):
        group = svgwrite.container.Group(id='layer%i' % idx)
        for shape in layer:
            path = shape2svgpath(shape)
            group.add(path)

        dwg.add(group)
    dwg.save()
