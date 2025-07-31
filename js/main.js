/*jshint esversion: 6 */
/*globals html2pdf */

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-edit-id]").forEach((el) => {
    const id = el.getAttribute("data-edit-id");
    const saved = localStorage.getItem(`resume-edit-${id}`);
    if (saved !== null) el.textContent = saved;
  });

  const editableElements = document.querySelectorAll(
    "span, h2, h3, h4, p, li, a"
  );

  editableElements.forEach((element) => {
    if (element.closest("button") || element.classList.contains("no-edit")) {
      return;
    }

    element.style.cursor = "pointer";

    element.addEventListener("click", function clickHandler() {
      if (this.getAttribute("contenteditable") === "true") {
        return;
      }

      this.setAttribute("contenteditable", "true");
      this.focus();

      const originalText = this.textContent;

      const handleBlur = () => {
        this.setAttribute("contenteditable", "false");

        if (this.textContent !== originalText) {
          this.classList.add("text-changed");
          if (this.hasAttribute("data-edit-id")) {
            localStorage.setItem(
              `resume-edit-${this.getAttribute("data-edit-id")}`,
              this.textContent
            );
          }
          setTimeout(() => {
            this.classList.remove("text-changed");
          }, 1000);
        }

        this.removeEventListener("blur", handleBlur);
        this.removeEventListener("keydown", handleKeyDown);
      };

      const handleKeyDown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.blur();
        }
      };

      this.addEventListener("blur", handleBlur);
      this.addEventListener("keydown", handleKeyDown);
    });
  });

  const downloadBtn = document.querySelector(".footer__download");
  if (downloadBtn) {
    downloadBtn.setAttribute("data-ripple", "");
    downloadBtn.addEventListener("click", (e) => {
      e.preventDefault();
      generatePDF();
    });
  }

  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-ripple]");
    if (!target || target.hasAttribute("contenteditable")) return;

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    const existingRipples = target.querySelectorAll(".ripple");
    existingRipples.forEach((r) => {
      r.remove();
    });

    target.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

function generatePDF() {
  const element = document.querySelector(".pdf-container");
  const button = document.querySelector(".footer__download");

  if (!element) {
    alert("PDF container not found (class .pdf-container).");
    return;
  }
  if (!button) {
    alert("PDF download button not found (class .footer__download).");
    return;
  }
  if (typeof html2pdf === "undefined") {
    alert("Library html2pdf not connected!");
    return;
  }

  button.textContent = "Generating PDF...";
  button.disabled = true;

  const options = {
    margin: [10, 10, 10, 10],
    filename: "my-resume.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  html2pdf()
    .from(element)
    .set(options)
    .save()
    .then(() => {
      button.textContent = "Download PDF";
      button.disabled = false;
    })
    .catch((error) => {
      console.error("Error generating PDF:", error);
      button.textContent = "Error! Try again.";
      button.disabled = false;
      alert(
        `Error generating PDF: ${
          error && error.message ? error.message : error
        }`
      );
    });
}
