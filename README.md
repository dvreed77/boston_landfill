# Boston Landfill

![Alt text](/data/screenshot_1.png?raw=true "Extracted Shapes from GIF")

This is a project I became interested in a long time ago.  I have been in Boston for over 12 years, and knew that Boston was built over time from a sequence of landfill projects.  I was interested in creating an app that allowed the user to scrub through time and see what parts of Boston were changed and when.  

After a little bit of digging, I found the best dataset [here][1], a crappy GIF.  I probably could have emailed the professor for something of higher quality, but since I am always up for a challenge, I wanted to use this to practice a variety of skills:

* Understand GIFs in Python
* Some basic image processing: dilation/erosion, thresholding, smoothing, etc.
* Extract contours/shapes from an image
* Shape manipulations: merging, intersection
* SVG creation
* GeoJSON creation
* Interactive React App with GeoJSON objects
* React App for timelines, and other Interactive elements


[1]: http://www.bc.edu/bc_org/avp/cas/fnart/fa267/sequence.html

[0]: http://scikit-image.org/docs/dev/auto_examples/xx_applications/plot_thresholding.html#bimodal-histogram

## Data
Original data was sourced here, a GIF image: http://www.bc.edu/bc_org/avp/cas/fnart/fa267/sequence.html


## Key Lessons
### Read GIF in Python
A colored GIF is just a F x M x N x C array, where F is the number of frames, M and N are the height and width, and C=3 are the 3 RGB channels.

Easy to read image (and make Greyscale):

```python
from skimage.io import imread
from skimage.color import rgb2gray

image = rgb2gray(imread(fname))
```

### Basic Image Processing
#### Resizing

```python
from skimage.transform import resize as resize_image

image = resize_image(image, (1000, 1000))
```

#### Slight blur

```python
from skimage.filters import gaussian

image = gaussian(image, 2)
```

#### Thresholding
I used `threshold_minimum` which is described as: The histogram of the input image is computed and smoothed until there are only two maxima. Then the minimum in between is the threshold value.

It is described in more detail [here][0]

```python
threshold = threshold_minimum(rimage)

binary = (image > threshold).astype(int)
  # binary = binary_dilation(binary)

  return binary

```

#### Erosion/Dilation
```python
from skimage.morphology import binary_dilation, binary_erosion

image = binary_dilation(image)
```

### Get contours from image
This creates contours where image = 0. Since we created a binary image with thresholding, this is easy.

```python
from skimage import measure

contours = measure.find_contours(image, 0)
```

### Contour to Shapes

```python
from shapely.geometry import Polygon

polygon = Polygon(c)
```

### Simplify shapes

```python
p = polygon.simplify(0.5, preserve_topology=True)
```


### Convert contours to SVG

In order to convert Shapely shapes to SVG, I manually built my own SVG path elements, similar to this:

```python
path = svgwrite.path.Path()
ext_points = list(shape.exterior.coords)

P = [['M', int(ext_points[0][1]), int(ext_points[0][0])]] + [['L', int(x[1]), int(x[0])] for x in ext_points[1:]] + [['Z']]
[path.push(*x) for x in P]

for interior in shape.interiors:
    int_points = list(interior.coords)

    P = [['M', int(int_points[0][1]), int(int_points[0][0])]] + [['L', int(x[1]), int(x[0])] for x in int_points[1:]] + [['Z']]
    [path.push(*x) for x in P]
```


### Convert SVG to Polygons

In order to convert Shapely shapes to SVG, I manually built my own SVG path elements, similar to this:

```python
from shapely.geometry import Polygon, MultiPolygon
from xml.dom import minidom, Node
from svg.path import parse_path as parse_svg_path

svg_doc = minidom.parse("data/svg_out.svg")


def parse_path(path):
    points = map(lambda x: (x.start.real, x.start.imag), parse_svg_path(path.getAttribute('d')))
    return points

points = parse_path(svg_doc.getElementsByTagName("path")[0])
Polygon(points)
```


### Convert Polygons to GeoJSON

```python
from shapely.geometry import mapping
import json

out = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "layer": 5, "region": "logan_airport" },
            "geometry": mapping(shape)
        }
    ]        
}

json.dump(out, open('test.geojson', 'w'))

```
