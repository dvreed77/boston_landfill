from sandbox.settings import DATA_DIR

from sandbox.extract_contours import *

landfill_gif = os.path.join(DATA_DIR, 'sequ_ani.gif')
precrop_image = os.path.join(DATA_DIR, 'precrop.jpg')

# extract image
gif_stack = get_image(landfill_gif)

# focus on 1st image
image = gif_stack[0]


# save to file to find crop boundaries
save_image(precrop_image, image)




# found crop using Preview
crop = [235, 235]
rimage = crop_resize_image(image, crop)
threshold = get_threshold(rimage)

threshold
