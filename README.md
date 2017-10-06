# Boston Landfill
This is a project I became interested in a long time ago.  I have been in Boston for over 12 years, and knew that Boston was built over time from a sequence of landfill projects.  I was interested in creating an app that allowed the user to scrub through time.  

After a little bit of digging, I found the best dataset [here][1], a crappy GIF.  I probably could have emailed the professor for something more high quality and since I am always up for a challenge, I wanted to use this as my base dataset to practice the following.

* Understand GIFs in Python
* Some basic image processing: dilation/corrosion, thresholding, smoothing, etc.
* Extract contours/shapes from an image
* Shape manipulations: merging, intersection
* SVG creation
* GeoJSON creation
* Interactive React App with GeoJSON objects


[1]: http://www.bc.edu/bc_org/avp/cas/fnart/fa267/sequence.html


## Data
Original data was sourced here, from GIF image: http://www.bc.edu/bc_org/avp/cas/fnart/fa267/sequence.html



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
