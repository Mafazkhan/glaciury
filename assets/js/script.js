
document.addEventListener("DOMContentLoaded", () => {

    const navbar = document.getElementById("navbar");
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");


    // NAVBAR GLASS EFFECT ON SCROLL

    function updateNavbar() {
        navbar.classList.toggle("scrolled", window.scrollY > 40);
    }

    window.addEventListener("scroll", updateNavbar, {
        passive: true
    });

    updateNavbar();


    // MOBILE NAVIGATION

    function closeMenu() {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
    }

    menuToggle.addEventListener("click", () => {

        const open = navMenu.classList.toggle("open");

        menuToggle.setAttribute(
            "aria-expanded",
            String(open)
        );

    });


    // CLOSE WHEN NAVIGATION LINK IS CLICKED

    navLinks.forEach(link => {

        link.addEventListener("click", closeMenu);

    });


    // CLOSE WHEN CLICKING OUTSIDE

    document.addEventListener("click", event => {

        if (
            !navbar.contains(event.target)
        ) {
            closeMenu();
        }

    });


    // CLOSE ON ESCAPE KEY

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeMenu();
        }

    });

});




/* =========================================================
   GLACIURY — SERVICES CAROUSEL
   Autoplay + Infinite Loop + Mobile Swipe
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const viewport = document.querySelector(".services-viewport");
    const cards = [...document.querySelectorAll(".service-card")];

    const prev = document.querySelector(".carousel-prev");
    const next = document.querySelector(".carousel-next");

    const dots = [...document.querySelectorAll(".service-dot")];
    const counter = document.querySelector(".current-service");

    if (!viewport || !cards.length) return;

    let activeIndex = 0;
    let autoplayTimer = null;
    let scrollFrame = null;

    const AUTOPLAY_DELAY = 3500;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let isHovered = false;
    let isInteracting = false;


    /* ==========================================
       CARD POSITION
    ========================================== */

    function getCardPosition(index) {

        return cards[index].offsetLeft - cards[0].offsetLeft;

    }


    /* ==========================================
       UPDATE CONTROLS
    ========================================== */

    function updateControls() {

        dots.forEach((dot, index) => {

            const active = index === activeIndex;

            dot.classList.toggle("active", active);

            if (active) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }

        });

        if (counter) {

            counter.textContent = String(
                activeIndex + 1
            ).padStart(2, "0");

        }

        if (prev) {
            prev.disabled = activeIndex === 0;
        }

        if (next) {
            next.disabled = activeIndex === cards.length - 1;
        }

    }


    /* ==========================================
       NAVIGATE TO SLIDE
    ========================================== */

    function goToSlide(index, smooth = true) {

        activeIndex = (index + cards.length) % cards.length;

        viewport.scrollTo({

            left: getCardPosition(activeIndex),

            behavior: smooth && !reducedMotion ? "smooth" : "auto"

        });

        updateControls();

        resetAutoplay();

    }


    /* ==========================================
       AUTOPLAY
    ========================================== */

    function stopAutoplay() {

        clearInterval(autoplayTimer);
        autoplayTimer = null;

    }


    function startAutoplay() {

        stopAutoplay();

        if (reducedMotion) return;

        if (
            document.hidden ||
            isHovered ||
            isInteracting ||
            cards.length < 2
        ) return;

        autoplayTimer = setInterval(() => {

            goToSlide(activeIndex + 1);

        }, AUTOPLAY_DELAY);

    }


    function resetAutoplay() {

        stopAutoplay();
        startAutoplay();

    }


    /* ==========================================
       DESKTOP ARROWS
    ========================================== */

    if (prev) {

        prev.addEventListener("click", () => {

            goToSlide(activeIndex - 1);

        });

    }

    if (next) {

        next.addEventListener("click", () => {

            goToSlide(activeIndex + 1);

        });

    }


    /* ==========================================
       DOT NAVIGATION
    ========================================== */

    dots.forEach((dot, index) => {

        dot.addEventListener("click", () => {

            goToSlide(index);

        });

    });


    /* ==========================================
       SCROLL / SWIPE DETECTION
    ========================================== */

    function detectActiveSlide() {

        const position = viewport.scrollLeft;

        let nearestIndex = 0;
        let smallestDistance = Infinity;

        cards.forEach((card, index) => {

            const distance = Math.abs(
                getCardPosition(index) - position
            );

            if (distance < smallestDistance) {

                smallestDistance = distance;
                nearestIndex = index;

            }

        });

        if (nearestIndex !== activeIndex) {

            activeIndex = nearestIndex;

            updateControls();

            resetAutoplay();

        }

    }


    viewport.addEventListener("scroll", () => {

        if (scrollFrame) {
            cancelAnimationFrame(scrollFrame);
        }

        scrollFrame = requestAnimationFrame(
            detectActiveSlide
        );

    }, { passive: true });


    /* ==========================================
       PAUSE ON DESKTOP HOVER
    ========================================== */

    viewport.addEventListener("mouseenter", () => {

        isHovered = true;
        stopAutoplay();

    });

    viewport.addEventListener("mouseleave", () => {

        isHovered = false;
        startAutoplay();

    });


    /* ==========================================
       PAUSE DURING MOBILE INTERACTION
    ========================================== */

    viewport.addEventListener("touchstart", () => {

        isInteracting = true;
        stopAutoplay();

    }, { passive: true });

    viewport.addEventListener("touchend", () => {

        isInteracting = false;

        resetAutoplay();

    }, { passive: true });

    viewport.addEventListener("touchcancel", () => {

        isInteracting = false;

        resetAutoplay();

    }, { passive: true });


    /* ==========================================
       PAUSE WHEN TAB IS HIDDEN
    ========================================== */

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {

            stopAutoplay();

        } else {

            startAutoplay();

        }

    });


    /* ==========================================
       IMAGE FALLBACK
    ========================================== */

    document.querySelectorAll(".service-image img").forEach(img => {

        function checkImage() {

            if (!img.naturalWidth) {

                img.hidden = true;

                img.parentElement.classList.add(
                    "service-image--fallback"
                );

            }

        }

        img.addEventListener("error", checkImage);

        if (img.complete) {
            checkImage();
        }

    });


    /* ==========================================
       KEYBOARD NAVIGATION
    ========================================== */

    viewport.addEventListener("keydown", event => {

        if (event.key === "ArrowRight") {

            event.preventDefault();
            goToSlide(activeIndex + 1);

        }

        if (event.key === "ArrowLeft") {

            event.preventDefault();
            goToSlide(activeIndex - 1);

        }

    });


    /* ==========================================
       RESPONSIVE RESIZE
    ========================================== */

    let resizeTimer;

    window.addEventListener("resize", () => {

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {

            viewport.scrollTo({

                left: getCardPosition(activeIndex),

                behavior: "auto"

            });

            updateControls();

            resetAutoplay();

        }, 150);

    });


    /* ==========================================
       INITIALIZE
    ========================================== */

    updateControls();
    startAutoplay();

});


/* =========================================================
   GLACIURY — AMC CONTRACTS
   Expandable Maintenance Inclusions
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const amcSection = document.querySelector(".amc-section");

    if (!amcSection) return;

    const toggleButtons = amcSection.querySelectorAll(".amc-toggle");


    toggleButtons.forEach(button => {

        button.addEventListener("click", () => {

            const isExpanded =
                button.getAttribute("aria-expanded") === "true";

            const details = button.nextElementSibling;

            if (!details) return;


            // Toggle current card

            button.setAttribute(
                "aria-expanded",
                String(!isExpanded)
            );

            details.hidden = isExpanded;


            // Update accessible state

            button.setAttribute(
                "aria-label",
                isExpanded
                    ? "Show maintenance inclusions"
                    : "Hide maintenance inclusions"
            );

        });

    });

});


/* =========================================================
   GLACIURY — WHY CHOOSE US
   Scroll Reveal Animation
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const section = document.querySelector(".why-section");

    if (!section) return;

    const elements = [
        ...section.querySelectorAll(
            ".why-heading, .why-card, .why-bottom"
        )
    ];

    // Respect accessibility preferences

    if (
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {
        return;
    }

    // Fallback for browsers without IntersectionObserver

    if (!("IntersectionObserver" in window)) {
        return;
    }

    // Prepare elements

    elements.forEach((element, index) => {

        element.classList.add("why-reveal");

        element.style.transitionDelay =
            `${index * 100}ms`;

    });

    // Observe scrolling

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("is-visible");

                observer.unobserve(entry.target);

            }

        });

    }, {

        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"

    });

    elements.forEach(element => {

        observer.observe(element);

    });

});


/* =========================================================
   GLACIURY — CONTACT SECTION
   Interactive Animations + Form Behaviour
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const section = document.querySelector(".contact-section");

    if (!section) return;


    /* ==========================================
       1. STAGGERED SCROLL REVEAL
    ========================================== */

    const revealElements = [
        section.querySelector(".contact-heading"),
        section.querySelector(".contact-info"),
        section.querySelector(".contact-form-panel"),
        section.querySelector(".contact-bottom")
    ].filter(Boolean);

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    revealElements.forEach((element, index) => {

        element.classList.add("contact-reveal");

        element.style.transitionDelay = `${index * 160}ms`;

    });

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("is-visible");

                        revealObserver.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        revealElements.forEach(element => {

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach(element => {

            element.classList.add("is-visible");

        });

    }


    /* ==========================================
       2. CURSOR FOLLOWING GLASS LIGHT
    ========================================== */

    const infoPanel = section.querySelector(".contact-info");

    if (infoPanel && window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches) {

        infoPanel.addEventListener("pointermove", event => {

            const rect = infoPanel.getBoundingClientRect();

            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            infoPanel.style.setProperty("--mouse-x", `${x}px`);
            infoPanel.style.setProperty("--mouse-y", `${y}px`);

        });

    }


    /* ==========================================
       3. INTERACTIVE FORM
    ========================================== */

    const form = section.querySelector("#glaciury-form");
    const status = section.querySelector("#form-status");

    if (!form || !status) return;

    const submitButton = form.querySelector(".contact-submit");


    // Clear error feedback as users edit fields

    form.querySelectorAll("input, select, textarea").forEach(field => {

        field.addEventListener("input", () => {

            status.textContent = "";
            status.className = "form-status";

        });

        field.addEventListener("change", () => {

            status.textContent = "";
            status.className = "form-status";

        });

    });


    // Form submission

    form.addEventListener("submit", event => {

        event.preventDefault();

        if (!form.reportValidity()) return;

        status.className = "form-status is-success";

        status.textContent =
            "The enquiry form is ready. Connect your email, WhatsApp or form backend to start receiving submissions.";

        submitButton.classList.add("form-ready");

    });


});



/* =========================================================
   GLACIURY — FOOTER INTERACTIONS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const footer = document.querySelector(".glacier-footer");

    if (!footer) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    /* 1. AUTOMATIC COPYRIGHT YEAR */

    const year = footer.querySelector("#footer-year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }


    /* 2. FLOATING SNOWFLAKES */

    const particles = footer.querySelector(".footer-particles");

    if (particles && !reducedMotion) {

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < 20; i++) {

            const snowflake = document.createElement("span");

            snowflake.className = "footer-particle";

            snowflake.textContent =
                Math.random() > 0.5 ? "❄" : "✧";

            snowflake.style.left =
                `${Math.random() * 100}%`;

            snowflake.style.setProperty(
                "--particle-size",
                `${10 + Math.random() * 13}px`
            );

            snowflake.style.setProperty(
                "--particle-duration",
                `${14 + Math.random() * 15}s`
            );

            snowflake.style.setProperty(
                "--particle-delay",
                `${-Math.random() * 25}s`
            );

            fragment.appendChild(snowflake);

        }

        particles.appendChild(fragment);

    }


    /* 3. STAGGERED REVEAL */

    const revealElements = footer.querySelectorAll(
        ".footer-reveal"
    );

    if (reducedMotion || !("IntersectionObserver" in window)) {

        revealElements.forEach(element => {
            element.classList.add("is-visible");
        });

    } else {

        const revealObserver = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("is-visible");

                        revealObserver.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.08,
                rootMargin: "0px 0px -25px 0px"
            }
        );

        revealElements.forEach((element, index) => {

            element.style.transitionDelay =
                `${Math.min(index * 120, 480)}ms`;

            revealObserver.observe(element);

        });

    }


    /* 4. GLOBAL SCROLL PROGRESS */

    const progressBar = footer.querySelector(
        ".footer-progress span"
    );

    let ticking = false;

    function updateProgress() {

        if (!progressBar) return;

        const scrollHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const percentage = scrollHeight > 0
            ? (window.scrollY / scrollHeight) * 100
            : 0;

        progressBar.style.width =
            `${Math.max(0, Math.min(100, percentage))}%`;

        ticking = false;

    }

    window.addEventListener("scroll", () => {

        if (!ticking) {

            requestAnimationFrame(updateProgress);

            ticking = true;

        }

    }, { passive: true });

    updateProgress();


    /* 5. BACK TO TOP */

    const backToTop = footer.querySelector(
        ".footer-back-top"
    );

    if (backToTop) {

        backToTop.addEventListener("click", () => {

            window.scrollTo({

                top: 0,

                behavior: reducedMotion ? "auto" : "smooth"

            });

        });

    }


    /* 6. PLACEHOLDER SOCIAL LINKS */

    footer.querySelectorAll(
        "[data-placeholder-link]"
    ).forEach(link => {

        link.addEventListener("click", event => {
            event.preventDefault();
        });

    });

});


