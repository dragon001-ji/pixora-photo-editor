
const upload = document.getElementById("upload");
const photo = document.getElementById("photo");
const placeholder = document.getElementById("placeholder");
const statusText = document.getElementById("status");

const brightness = document.getElementById("brightness");
const contrast = document.getElementById("contrast");
const saturation = document.getElementById("saturation");

const brightnessValue = document.getElementById("brightnessValue");
const contrastValue = document.getElementById("contrastValue");
const saturationValue = document.getElementById("saturationValue");

const filterButtons = document.querySelectorAll(".filter");
const rotateButton = document.getElementById("rotate");
const resetButton = document.getElementById("reset");
const downloadButton = document.getElementById("download");

let originalImage = null;
let rotation = 0;
let selectedFilter = "none";
let currentFileName = "pixora-edited";
let imageURL = null;

const filters = {
  none: "none",
  "grayscale(100%)": "grayscale(100%)",
  "sepia(80%)": "sepia(80%)",
  "saturate(160%)": "saturate(160%)",
  "hue-rotate(90deg)": "hue-rotate(90deg)"
};

function updatePreview() {
  if (!originalImage) return;

  photo.style.filter = [
    `brightness(${brightness.value}%)`,
    `contrast(${contrast.value}%)`,
    `saturate(${saturation.value}%)`,
    filters[selectedFilter] || "none"
  ].join(" ");

  photo.style.transform = `rotate(${rotation}deg)`;

  brightnessValue.value = `${brightness.value}%`;
  contrastValue.value = `${contrast.value}%`;
  saturationValue.value = `${saturation.value}%`;

  brightnessValue.textContent = `${brightness.value}%`;
  contrastValue.textContent = `${contrast.value}%`;
  saturationValue.textContent = `${saturation.value}%`;
}

function loadImage(file) {
  if (!file || !file.type.startsWith("image/")) {
    statusText.textContent = "Please choose a valid image";
    return;
  }

  if (imageURL) {
    URL.revokeObjectURL(imageURL);
  }

  imageURL = URL.createObjectURL(file);
  const image = new Image();

  image.onload = () => {
    originalImage = image;
    currentFileName = file.name.replace(/\.[^.]+$/, "") || "pixora-edited";

    photo.src = imageURL;
    photo.hidden = false;
    placeholder.hidden = true;

    rotation = 0;
    selectedFilter = "none";

    brightness.value = 100;
    contrast.value = 100;
    saturation.value = 100;

    filterButtons.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.filter === "none"
      );
    });

    updatePreview();
    statusText.textContent = `${image.width} × ${image.height}`;
  };

  image.onerror = () => {
    statusText.textContent = "Unable to load this image";
    URL.revokeObjectURL(imageURL);
    imageURL = null;
  };

  image.src = imageURL;
}

upload.addEventListener("change", event => {
  const file = event.target.files[0];
  if (file) loadImage(file);

  // Allow selecting the same file again.
  event.target.value = "";
});

[brightness, contrast, saturation].forEach(control => {
  control.addEventListener("input", updatePreview);
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedFilter = button.dataset.filter;

    filterButtons.forEach(item => {
      item.classList.toggle("active", item === button);
    });

    updatePreview();
  });
});

rotateButton.addEventListener("click", () => {
  if (!originalImage) {
    statusText.textContent = "Upload a photo first";
    return;
  }

  rotation = (rotation + 90) % 360;
  updatePreview();
});

resetButton.addEventListener("click", () => {
  if (!originalImage) {
    statusText.textContent = "Upload a photo first";
    return;
  }

  brightness.value = 100;
  contrast.value = 100;
  saturation.value = 100;
  rotation = 0;
  selectedFilter = "none";

  filterButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.filter === "none"
    );
  });

  updatePreview();
  statusText.textContent = "Edits reset";
});

downloadButton.addEventListener("click", () => {
  if (!originalImage) {
    statusText.textContent = "Upload a photo first";
    return;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const sideways = rotation % 180 !== 0;
  canvas.width = sideways
    ? originalImage.height
    : originalImage.width;
  canvas.height = sideways
    ? originalImage.width
    : originalImage.height;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotation * Math.PI / 180);

  ctx.filter = [
    `brightness(${brightness.value}%)`,
    `contrast(${contrast.value}%)`,
    `saturate(${saturation.value}%)`,
    filters[selectedFilter] || "none"
  ].join(" ");

  ctx.drawImage(
    originalImage,
    -originalImage.width / 2,
    -originalImage.height / 2
  );

  ctx.filter = "none";

  canvas.toBlob(blob => {
    if (!blob) {
      statusText.textContent = "Export failed. Try another image.";
      return;
    }

    const link = document.createElement("a");
    const downloadURL = URL.createObjectURL(blob);

    link.href = downloadURL;
    link.download = `${currentFileName}-pixora.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(downloadURL), 1000);
    statusText.textContent = "Photo downloaded!";
  }, "image/png");
});
