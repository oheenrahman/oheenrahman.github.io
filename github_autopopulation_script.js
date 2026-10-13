(async () => {
  const username = "oheenrahman";
  const wrapper = document.getElementById("projects-wrapper");
  const carousel = document.querySelector(".projectsSwiper");
  if (!wrapper || !carousel) return;
  let slider;
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const repos = await response.json();
    if (!Array.isArray(repos)) throw new Error("Unexpected GitHub response");
    const projects = repos.filter(repo => !repo.fork && !repo.archived);
    wrapper.replaceChildren();
    if (!projects.length) throw new Error("No public projects available");
    projects.forEach(repo => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      const card = document.createElement("article");
      card.className = "project-card";
      const media = document.createElement("div");
      media.className = "project-media";
      const fallback = document.createElement("div");
      fallback.className = "project-image-fallback";
      fallback.setAttribute("aria-hidden", "true");
      const symbol = document.createElement("span");
      symbol.className = "project-symbol";
      symbol.textContent = "</>";
      const label = document.createElement("span");
      label.textContent = repo.language || "GitHub project";
      fallback.append(symbol, label);
      const img = document.createElement("img");
      img.alt = "";
      img.hidden = true;
      img.addEventListener("load", () => {
        img.hidden = false;
        fallback.hidden = true;
        slider?.updateAutoHeight();
      });
      img.addEventListener("error", () => {
        img.hidden = true;
        fallback.hidden = false;
        slider?.updateAutoHeight();
      });
      img.src = `https://opengraph.githubassets.com/1/${username}/${encodeURIComponent(repo.name)}`;
      media.append(fallback, img);
      const heading = document.createElement("h3");
      heading.textContent = repo.name.replace(/[-_]+/g, " ");
      const description = document.createElement("p");
      description.textContent = repo.description || (repo.language
        ? `Explore the ${repo.language} source code and project details on GitHub.`
        : "Explore the source code and project details on GitHub.");
      const link = document.createElement("a");
      link.href = repo.html_url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "View on GitHub →";
      card.append(media, heading, description, link);
      slide.append(card);
      wrapper.append(slide);
    });
    slider = new Swiper(".projectsSwiper", {
      loop: projects.length > 1,
      autoHeight: true,
      slidesPerView: 1,
      spaceBetween: 30,
      watchOverflow: true,
      autoplay: projects.length > 1 ? { delay: 5000, disableOnInteraction: true, pauseOnMouseEnter: true } : false,
      keyboard: { enabled: true },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
    });
  } catch (err) {
    console.error("Failed to load GitHub repos:", err);
    wrapper.replaceChildren();
    const message = document.createElement("p");
    message.className = "project-load-message";
    message.append("Projects are temporarily unavailable. ");
    const link = document.createElement("a");
    link.href = `https://github.com/${username}?tab=repositories`;
    link.textContent = "Browse my projects on GitHub →";
    link.target = "_blank";
    link.rel = "noopener";
    message.append(link);
    wrapper.append(message);
    carousel.querySelectorAll(".swiper-button-prev, .swiper-button-next, .swiper-pagination").forEach(el => { el.hidden = true; });
  }
})();