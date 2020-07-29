class Mask {
  constructor({ src }) {
    this.image = new Image();
    this.image.src = src;
    this.image.onload = () => {
      this.savePixelDataToMemory(this.image);
    };
  }
  savePixelDataToMemory(image) {
    let { height, width } = image;
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    this.height = height;
    this.width = width;

    this.ctx = canvas.getContext("2d");
    this.ctx.drawImage(image, 0, 0, width, height);
  }
  contains(x, y) {
    if (!this.ctx) {
      return false;
    }
    let actualX = Math.round(x * this.width);
    let actualY = Math.round(y * this.height);
    return this.ctx.getImageData(actualX, actualY, 1, 1).data[3] > 0;
  }
}

function fetchMetadata() {
  return fetch("/objects.json").then((res) => res.json());
}

function initialiseCanvasSize() {
  let container = document.getElementById("container");
  let canvas = document.getElementById("main-canvas");

  return new Promise(function (resolve) {
    setTimeout(function () {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      resolve({
        width: canvas.width,
        height: canvas.height
      });
    }, 500);
  });
}

window.onload = async function () {
  let { height, width } = await initialiseCanvasSize();

  let { objects: objectNameList, fps } = await fetchMetadata();
  let video = document.getElementById("video");

  let canvas = document.getElementById("main-canvas");
  let ctx = canvas.getContext("2d");

  let { x: offsetX, y: offsetY } = canvas.getBoundingClientRect();

  function clearCanvas() {
    ctx.clearRect(0, 0, width, height);
  }

  let currentFrameId = 0;
  function updateCurrentFrameId(_, metadata) {
    let count = metadata.mediaTime * fps;
    currentFrameId = Math.round(count);
    video.requestVideoFrameCallback(updateCurrentFrameId);
  }
  video.requestVideoFrameCallback(updateCurrentFrameId);

  let mouseMoveListener;
  function cleanup() {
    window.removeEventListener("mousemove", mouseMoveListener);
    mouseMoveListener = null;
    clearCanvas();
  }
  function initialiseMasks() {
    cleanup();

    let frameId = Math.max(0, Math.min(Math.round(video.duration * fps), currentFrameId));
    let maskList = objectNameList.map(function (_, objectId) {
      return new Mask({ src: `/masks/${frameId}-${objectId + 1}.png` });
    });

    let currentMask = null;
    mouseMoveListener = function (e) {
      let found = null;
      let x = (e.screenX - offsetX) / width;
      let y = (e.screenY - offsetY) / height;
      for (let mask of maskList) {
        if (mask.contains(x, y)) {
          found = mask;
          break;
        }
      }
      if (found === currentMask) {
        return;
      }
      if (currentMask === null) {
        currentMask = found;
        ctx.drawImage(found.image, 0, 0, width, height);
      } else {
        currentMask = null;
        clearCanvas();
      }
    };
    window.addEventListener("mousemove", mouseMoveListener);
  }

  video.onpause = initialiseMasks;
  video.onseeked = initialiseMasks;
  video.onplay = cleanup;
  video.onended = cleanup;
};
