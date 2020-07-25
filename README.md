# Interactive video

## Usage

- Put the video and the file `objects.json` into `./public`

- Create a folder `masks` in `./public`

- Put `masks.npy` (file that contains all masks for all frames, all objects) in the root directory (`.`)

- Run `python3 mask-extractor.py` to extract masks for each object for each frame.

- Start the server by running `yarn start` and go to `localhost:3000`
