import numpy as np
import imageio
import os
import random

a = np.load("masks.npy")
n_objects = a.max()

# init color map

def bitget(byteval, idx):
    return (byteval & (1 << idx)) != 0

colours = np.zeros((n_objects +1, 3), dtype='uint8')
for i in range(n_objects + 1):
    r = g = b = 0
    c = i
    for j in range(8):
        r = r | (bitget(c, 0) << 7 - j)
        g = g | (bitget(c, 1) << 7 - j)
        b = b | (bitget(c, 2) << 7 - j)
        c = c >> 3
    colours[i] = np.array([r, g, b])

for idx, frame in enumerate(a):
  for object_id in range(1, n_objects + 1):
    mask = np.copy(frame)
    mask[mask != object_id] = 0
    image = np.stack([mask, mask, mask, mask], axis=2)
    image[mask == object_id] = list(colours[object_id]) + [128]

    imageio.imwrite(os.path.join("public", "masks", f"{idx}-{object_id}.png"), image)
