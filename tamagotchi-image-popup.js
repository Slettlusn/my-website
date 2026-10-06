(() => {
  const trigger = document.querySelector("[data-image-popup]");
  const contentFrame = document.querySelector('iframe.luno-frame[name="window-content"]');
  if (!trigger && !contentFrame) return;

  // Messages also work between local HTML files, which cannot share their DOM.
  if (trigger && window.parent !== window && window.name === "window-content") {
    trigger.addEventListener("click", () => {
      window.parent.postMessage({
        type: "tamagotchi:open-tools-image",
        alt: trigger.querySelector("img").alt
      }, "*");
    });

    window.addEventListener("message", (event) => {
      if (event.source === window.parent && event.data?.type === "tamagotchi:tools-image-closed") {
        trigger.focus();
      }
    });
    return;
  }

  const popup = document.createElement("dialog");
  popup.className = "image-popup";
  popup.setAttribute("aria-label", "Tools and components used");

  const closeButton = document.createElement("button");
  closeButton.className = "image-popup-close";
  closeButton.type = "button";
  closeButton.textContent = "Close ×";
  closeButton.autofocus = true;

  const imageContent = document.createElement("div");
  imageContent.className = "image-popup-content";

  const enlargedImage = document.createElement("img");
  enlargedImage.className = "image-popup-image";
  enlargedImage.src = new URL("bilder/tools-used.png", document.baseURI).href;
  enlargedImage.alt = "Tools and components used for the Tamagotchi project";

  imageContent.append(enlargedImage);
  popup.append(closeButton, imageContent);
  document.body.append(popup);

  const openPopup = (alt) => {
    if (typeof alt === "string") enlargedImage.alt = alt;
    imageContent.scrollTo(0, 0);
    if (!popup.open) popup.showModal();
    document.documentElement.classList.add("image-popup-open");
  };

  if (trigger) {
    trigger.addEventListener("click", () => openPopup(trigger.querySelector("img").alt));
  }

  if (contentFrame) {
    window.addEventListener("message", (event) => {
      if (event.source === contentFrame.contentWindow && event.data?.type === "tamagotchi:open-tools-image") {
        openPopup(event.data.alt);
      }
    });

    contentFrame.addEventListener("load", () => {
      if (popup.open) popup.close();
    });
  }

  closeButton.addEventListener("click", () => popup.close());

  popup.addEventListener("click", (event) => {
    if (event.target !== popup) return;

    const bounds = popup.getBoundingClientRect();
    if (
      event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom
    ) {
      popup.close();
    }
  });

  popup.addEventListener("close", () => {
    document.documentElement.classList.remove("image-popup-open");
    if (trigger) {
      trigger.focus();
    } else {
      contentFrame.focus();
      contentFrame.contentWindow.postMessage({ type: "tamagotchi:tools-image-closed" }, "*");
    }
  });

  window.addEventListener("pagehide", () => {
    popup.close();
    popup.remove();
    document.documentElement.classList.remove("image-popup-open");
  });
})();
