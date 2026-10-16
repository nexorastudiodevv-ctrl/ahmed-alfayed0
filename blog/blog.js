document.querySelectorAll("[data-blog-categories]").forEach((categoryList) => {
  const buttons = [...categoryList.querySelectorAll("[data-blog-filter]")];
  const cards = [...document.querySelectorAll("[data-blog-category]")];
  const emptyState = document.querySelector("[data-blog-empty]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCategory = button.dataset.blogFilter;
      let visibleCount = 0;

      buttons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      cards.forEach((card) => {
        const isVisible = selectedCategory === "all" || card.dataset.blogCategory === selectedCategory;
        card.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });

      if (emptyState) emptyState.hidden = visibleCount > 0;
    });
  });
});
