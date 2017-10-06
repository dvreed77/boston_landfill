# Source Data
Original data was sourced here: http://www.bc.edu/bc_org/avp/cas/fnart/fa267/sequence.html



## Key Lessons

### Get contours from image

In order to get contours from image

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


### Convert contours to GeoJSON
