(function () {
  document.documentElement.classList.add("js");

  var progress = document.createElement("div");
  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  function updateProgress() {
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.transform = "scaleX(" + Math.min(Math.max(ratio, 0), 1) + ")";
  }

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });

  var hero = document.querySelector(".hero");
  var programItems = Array.prototype.slice.call(document.querySelectorAll(".program-item"));

  programItems.forEach(function (item, index) {
    item.addEventListener("mouseenter", function () {
      if (hero) {
        hero.style.setProperty("--spatial-shift", String(index + 1));
      }
    });
  });

  if (hero && programItems.length > 0) {
    hero.style.setProperty("--spatial-shift", "1");
  }

  var content = document.querySelector(".content");
  var tocList = document.querySelector("[data-toc-list]");
  var headings = content
    ? Array.prototype.slice.call(content.querySelectorAll("h2, h3")).filter(function (heading) {
        return !heading.closest(".map-card");
      })
    : [];

  headings.forEach(function (heading, index) {
    if (!heading.id) {
      heading.id = "section-" + (index + 1);
    }

    if (!heading.querySelector(".heading-anchor")) {
      var anchor = document.createElement("a");
      anchor.className = "heading-anchor";
      anchor.href = "#" + heading.id;
      anchor.setAttribute("aria-label", "复制此小节链接");
      anchor.textContent = "#";
      heading.appendChild(anchor);
    }

    if (tocList) {
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.dataset.level = heading.tagName === "H3" ? "3" : "2";
      link.textContent = heading.childNodes[0] ? heading.childNodes[0].textContent.trim() : heading.textContent.trim();
      item.appendChild(link);
      tocList.appendChild(item);
    }
  });

  if (tocList && headings.length === 0) {
    tocList.parentElement.hidden = true;
  }

  var revealTargets = document.querySelectorAll(".program-item, .map-card, .content > section, .content > h2, .content > table");

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    revealTargets.forEach(function (target) {
      target.classList.add("reveal");
      revealObserver.observe(target);
    });
  } else {
    revealTargets.forEach(function (target) {
      target.classList.add("is-visible");
    });
  }

  var tocLinks = tocList ? Array.prototype.slice.call(tocList.querySelectorAll("a")) : [];

  if ("IntersectionObserver" in window && tocLinks.length > 0) {
    var activeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          tocLinks.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-16% 0px -72% 0px", threshold: 0 }
    );

    headings.forEach(function (heading) {
      activeObserver.observe(heading);
    });
  }
})();
