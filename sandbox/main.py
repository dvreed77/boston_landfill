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

to_svg2('data/final_temp.svg',  layers2[::-1] + [layers[0]])
