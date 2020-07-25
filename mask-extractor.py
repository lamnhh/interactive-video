import numpy as np
import imageio
import os
import random

a = np.load("masks.npy")
n_objects = a.max()

colours = np.stack([random.sample(range(256), n_objects), random.sample(range(256), n_objects), random.sample(range(256), n_objects)])

for idx, frame in enumerate(a):
  for object_id in range(1, n_objects + 1):
    mask = np.copy(frame)
    mask[mask != object_id] = 0
    image = np.stack([mask, mask, mask, mask], axis=2)
    image[mask == object_id] = list(colours[object_id - 1]) + [128]

    imageio.imwrite(os.path.join("public", "masks", f"{idx}-{object_id}.png"), image)