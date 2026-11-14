const FIRST_APOD_DATE = "1995-06-16";
const dateForm = document.querySelector("#date-form");
const dateInput = document.querySelector("#apod-date-input");
const submitButton = dateForm.querySelector("button");
const loadingMessage = document.querySelector("#loading-message");
const errorMessage = document.querySelector("#error-message");
const result = document.querySelector("#apod-result");
const mediaContainer = document.querySelector("#apod-media");
const apodDate = document.querySelector("#apod-date");
const apodTitle = document.querySelector("#apod-title");
const apodExplanation = document.querySelector("#apod-explanation");
const today = new Date().toISOString().slice(0, 10);

dateInput.min = FIRST_APOD_DATE;
dateInput.max = today;
dateInput.value = today;

function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function renderMedia(apod) {
  mediaContainer.replaceChildren();

  if (apod.media_type === "image") {
    const image = document.createElement("img");
    image.src = apod.url;
    image.alt = apod.title;
    image.loading = "lazy";
    image.decoding = "async";

    if (apod.hdurl && apod.hdurl !== apod.url) {
      const link = document.createElement("a");
      link.className = "high-resolution-link";
      link.href = apod.hdurl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `Abrir imagem em alta resolução: ${apod.title}`);
      link.append(image);
      mediaContainer.append(link);
      return;
    }

    mediaContainer.append(image);
    return;
  }

  const video = document.createElement("iframe");
  video.src = apod.url;
  video.title = `Vídeo: ${apod.title}`;
  video.loading = "lazy";
  video.referrerPolicy = "strict-origin-when-cross-origin";
  video.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture";
  video.setAttribute("sandbox", "allow-scripts allow-same-origin allow-presentation");
  video.allowFullscreen = true;
  mediaContainer.append(video);
}

function renderApod(apod) {
  renderMedia(apod);
  apodDate.textContent = formatDate(apod.date);
  apodTitle.textContent = apod.title;
  apodExplanation.textContent = apod.explanation;
  result.hidden = false;
}

async function loadApod(date) {
  result.hidden = true;
  errorMessage.hidden = true;
  loadingMessage.hidden = false;
  submitButton.disabled = true;
  dateInput.disabled = true;

  try {
    const response = await fetch(`/api/apod?date=${encodeURIComponent(date)}`, {
      headers: { accept: "application/json" },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : "Não foi possível carregar o conteúdo. Tente novamente.",
      );
    }

    renderApod(data);
  } catch (error) {
    errorMessage.textContent =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar o conteúdo. Tente novamente.";
    errorMessage.hidden = false;
  } finally {
    loadingMessage.hidden = true;
    submitButton.disabled = false;
    dateInput.disabled = false;
  }
}

dateForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!dateForm.reportValidity()) {
    return;
  }

  loadApod(dateInput.value);
});

loadApod(dateInput.value);
