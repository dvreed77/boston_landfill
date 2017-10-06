from sandbox.settings import DATA_DIR

from sandbox.extract_contours import *

landfill_gif = os.path.join(DATA_DIR, 'sequ_ani.gif')
precrop_image = os.path.join(DATA_DIR, 'precrop.jpg')
svg_out = os.path.join(DATA_DIR, 'layer1.svg')

# extract image
gif_stack = get_image(landfill_gif)

# focus on 1st image
image = gif_stack[0]


# save to file to find crop boundaries
save_image(precrop_image, image)

# found crop using Preview
crop = [235, 235]
rimage = crop_resize_image(image, crop)
imshow(rimage)
threshold = threshold_minimum(rimage)
timage = threshold_image(rimage, threshold)
imshow(timage)

contours = extract_contours(image)
to_svg(fname=svg_out, contours=contours)




# focus on last image
image = gif_stack[-1]
rimage = crop_resize_image(image, crop)
imshow(rimage)

timage = threshold_image(rimage, threshold)
imshow(timage)



contours = extract_contours(timage)

contours = filter(lambda x: len(x) > 80, contours)
len(contours)

o = []
for idx, c in enumerate(contours):
    polygon = Polygon(c)
    p = polygon.simplify(0.5, preserve_topology=True)
    o.append(p)


out_shapes = merge_shapes(o)
to_svg(fname=os.path.join(DATA_DIR, 'layer_last.svg'), shapes=out_shapes)



### DO IT FOR THE WHOLE STACK
gif_shape = gif_stack.shape

new_gif_stack = np.empty((gif_shape[0], 1000, 1000))

for i, g in enumerate(gif_stack):
    itmp_ = pre_process_image(g, crop, threshold)
    new_gif_stack[i,:,:] = itmp_


imshow(new_gif_stack[50])

image = new_gif_stack[50]

padding = 10
shape = image.shape

nimage = np.zeros((shape[0]+2*padding,shape[1]+2*padding))

nimage[padding:shape[0]+padding,padding:shape[1]+padding] = image

imshow(nimage)


contours = extract_contours(nimage)
to_svg(fname=os.path.join(DATA_DIR, 'layer50.svg'), contours=contours)
