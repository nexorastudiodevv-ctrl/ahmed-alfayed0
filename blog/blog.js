document.querySelectorAll("[data-blog-categories]").forEach((categoryList) => {
  const buttons = [...categoryList.querySelectorAll("[data-blog-filter]")];
  const emptyState = document.querySelector("[data-blog-empty]");
  let selectedCategory = "all";

  const applyFilter = () => {
    let visibleCount = 0;

    buttons.forEach((button) => {
      const isActive = button.dataset.blogFilter === selectedCategory;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    document.querySelectorAll("[data-blog-category]").forEach((card) => {
      const categories = card.dataset.blogCategory.split(/\s+/);
      const isVisible = selectedCategory === "all" || categories.includes(selectedCategory);
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (emptyState) emptyState.hidden = visibleCount > 0;

    document.querySelectorAll("[data-blog-filter-count]").forEach((count) => {
      const filter = count.dataset.blogFilterCount;
      const total = [...document.querySelectorAll("[data-blog-category]")]
        .filter((card) => filter === "all" || card.dataset.blogCategory.split(/\s+/).includes(filter))
        .length;
      count.textContent = String(total);
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.blogFilter;
      applyFilter();
    });
  });

  document.addEventListener("blog:cards-changed", applyFilter);
  applyFilter();
});
