(async () => {
  const username = "oheenrahman";                   
  const endpoint = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;

  try {

    const repos = await fetch(endpoint).then(r => r.json());

    const projects = repos.filter(r => !r.fork && !r.archived);

    const wrapper = document.getElementById("projects-wrapper");
    projects.forEach(repo => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.innerHTML = `
        <img src="https://opengraph.githubassets.com/1/${username}/${repo.name}"
            alt="${repo.name}"
            style="
              width: 100%;
              aspect-ratio: 1.91/1;
              object-fit: contain;
              border-radius: 12px
              
            ">
        <h3>${repo.name}</h3>
        <p>${repo.description || "No description provided."}</p>
        <a href="${repo.html_url}" target="_blank" rel="noopener">View on GitHub →</a>
      `;
      wrapper.appendChild(slide);
    });

    new Swiper(".projectsSwiper", {
      loop: true,
      centeredSlides: true,
      slidesPerView: 1,
      spaceBetween: 30,
      autoplay: { delay: 3500, disableOnInteraction: false },
      keyboard: { enabled: true },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
      breakpoints: {
        900: { slidesPerView: 2 }
      }
    });
  } catch (err) {
    console.error("Failed to load GitHub repos:", err);
  }
})();
