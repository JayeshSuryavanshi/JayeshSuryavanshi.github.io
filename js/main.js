

(function($) {

    "use strict";
    
    const cfg = {
                scrollDuration : 800, // smoothscroll duration
                mailChimpURL   : ''   // mailchimp url
                };
    const $WIN = $(window);


    // Add the User Agent to the <html>
    // will be used for IE10/IE11 detection (Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0; rv:11.0))
    const doc = document.documentElement;
    doc.setAttribute('data-useragent', navigator.userAgent);



   /* preloader
    * -------------------------------------------------- */
    const ssPreloader = function() {

        $("html").addClass('ss-preload');

        const reveal = function() {
            if (reveal.done) { return; }
            reveal.done = true;

            // Only jump to the top when there is no hash to honour. The old
            // unconditional reset discarded every deep link on the site, so
            // /#about landed on the hero video.
            if (!window.location.hash) {
                $('html, body').scrollTop(0);
            }

            $("#loader").fadeOut(120, function() {
                $("#preloader").fadeOut(150, function() {
                    // Re-apply the hash now the cover is gone: the browser's
                    // own scroll happened while the overlay was still up.
                    // By id, not querySelector: a hash like #about?utm=x or #0
                    // is not a valid selector and would throw.
                    if (window.location.hash) {
                        var target = null;
                        try { target = document.getElementById(decodeURIComponent(window.location.hash.slice(1))); } catch (e) {}
                        if (target) { target.scrollIntoView(); }
                    }
                });
            });

            $("html").removeClass('ss-preload');
            $("html").addClass('ss-loaded');
        };

        // Do not wait on window load: on a phone connection that sits behind a
        // 4 MB video, which held the cover up for about 7 seconds. Reveal at
        // DOMContentLoaded with a hard cap so a slow asset can never trap it.
        $(document).ready(reveal);
        setTimeout(reveal, 1500);
    };



   /* move header
    * -------------------------------------------------- */
    const ssMoveHeader = function () {

        const $hero = $('.s-hero'),
              $hdr = $('.s-header'),
              triggerHeight = $hero.outerHeight() - 170;


        $WIN.on('scroll', function () {

            let loc = $WIN.scrollTop();

            if (loc > triggerHeight) {
                $hdr.addClass('sticky');
            } else {
                $hdr.removeClass('sticky');
            }

            if (loc > triggerHeight + 20) {
                $hdr.addClass('offset');
            } else {
                $hdr.removeClass('offset');
            }

            if (loc > triggerHeight + 150) {
                $hdr.addClass('scrolling');
            } else {
                $hdr.removeClass('scrolling');
            }

        });

    };



   /* mobile menu
    * ---------------------------------------------------- */ 
    const ssMobileMenu = function() {

        const $toggleButton = $('.header-menu-toggle');
        const $headerContent = $('.header-content');
        const $siteBody = $("body");
        const $behind = $('#main, .s-footer');

        // One place for the open state, so the class, aria-expanded and the
        // inert page behind the panel can never disagree.
        const setMenu = function(open) {
            $toggleButton.toggleClass('is-clicked', open).attr('aria-expanded', open ? 'true' : 'false');
            $siteBody.toggleClass('menu-is-open', open);
            $behind.prop('inert', open);
        };

        $toggleButton.on('click', function(event){
            event.preventDefault();
            const open = !$siteBody.hasClass('menu-is-open');
            setMenu(open);

            if (open) {
                // The links sit in a visibility:hidden wrapper until its
                // delayed transition starts, so focus them once it has.
                const first = $headerContent.find('.header-nav a')[0];
                const focusFirst = function() {
                    if ($siteBody.hasClass('menu-is-open') && document.activeElement === $toggleButton[0] && first) {
                        first.focus();
                    }
                };
                $headerContent.find('.header-nav-wrap').off('transitionend.menu').on('transitionend.menu', function(e) {
                    if (e.target === this) { $(this).off('transitionend.menu'); focusFirst(); }
                });
                setTimeout(focusFirst, 1200);
            }
        });

        $(document).on('keydown', function(event) {
            if (event.key === 'Escape' && $siteBody.hasClass('menu-is-open')) {
                setMenu(false);
                $toggleButton.trigger('focus');
            }
        });

        $headerContent.find('.header-nav a, .btn').on("click", function() {

            // at 900px and below
            if (window.matchMedia('(max-width: 900px)').matches) {
                setMenu(false);
            }
        });

        $WIN.on('resize', function() {

            // above 900px
            if (window.matchMedia('(min-width: 901px)').matches && $siteBody.hasClass("menu-is-open")) {
                setMenu(false);
            }
        });

    };


   /* accordion
    * ------------------------------------------------------ */
    const ssAccordion = function() {

        // Scoped per list. The original queried .services-list__item globally
        // and then hid every panel after index 0, so once a second accordion
        // existed on the page only one panel survived and it always belonged to
        // the first list. The Open Source section therefore rendered entirely
        // collapsed despite its is-active marker, hiding all of its links, and
        // clicking either list closed the other.
        $('.services-list').each(function() {

            const $list = $(this),
                  $items = $list.children('.services-list__item'),
                  $panels = $items.children('.services-list__item-body'),
                  $toggles = $items.find('.services-list__toggle'),
                  $marked = $items.filter('.is-active').first(),
                  $open = $marked.length ? $marked : $items.first();

            $panels.hide();
            $items.removeClass('is-active');
            $open.addClass('is-active').children('.services-list__item-body').show();
            $toggles.attr('aria-expanded', 'false');
            $open.find('.services-list__toggle').attr('aria-expanded', 'true');

            $list.on('click', '.services-list__item-header', function() {

                const $this = $(this),
                      $curItem = $this.parent(),
                      $curPanel = $this.next(),
                      hdr = this,
                      pinned = hdr.getBoundingClientRect().top;

                if (!$curItem.hasClass('is-active')) {
                    // A panel collapsing above the tapped header drags it up
                    // and off screen; scroll with it so the header stays put.
                    const pin = function() {
                        const d = hdr.getBoundingClientRect().top - pinned;
                        if (d < 0) { window.scrollBy(0, d); }
                    };
                    $panels.slideUp({ progress: pin });
                    $curPanel.slideDown();
                    $items.removeClass('is-active');
                    $curItem.addClass('is-active');
                    pin();
                    $toggles.attr('aria-expanded', 'false');
                    $this.find('.services-list__toggle').attr('aria-expanded', 'true');
                }

                return false;
            });
        });
    };



   /* photoswipe
    * ----------------------------------------------------- */
    const ssPhotoswipe = function() {
        const items = [],
            $pswp = $('.pswp')[0],
            $folioItems = $('.folio-item');

        // get items
        $folioItems.each( function(i) {

            let $folio = $(this),
                $thumbLink =  $folio.find('.folio-item__thumb-link'),
                $title = $folio.find('.folio-item__title'),
                $caption = $folio.find('.folio-item__caption'),
                $link = $folio.find('.folio-item__project-link'),
                $titleText = '<h4>' + $.trim($title.html()) + '</h4>',
                $captionText = $.trim($caption.html()),
                $href = $thumbLink.attr('href'),
                $size = $thumbLink.data('size').split('x'),
                $width  = $size[0],
                $height = $size[1];
        
            let item = {
                src  : $href,
                w    : $width,
                h    : $height,
                alt  : $thumbLink.find('img').attr('alt') || ''
            }

            if ($caption.length > 0) {
                item.title = $.trim($titleText + $captionText);
            }

            // the caption was a dead end: carry the card's own link into it
            if ($link.length) {
                item.title = (item.title || $titleText) +
                    '<p class="pswp__cta"><a href="' + $link.attr('href') + '" target="_blank" rel="noopener">' +
                    $.trim($link.contents().first().text()).replace(/\s+/g, ' ') +
                    ' <span aria-hidden="true">\u279c</span><span class="visually-hidden"> (opens in a new tab)</span></a></p>';
            }

            items.push(item);
        });

        // bind click event
        $folioItems.each(function(i) {

            $(this).find('.folio-item__thumb-link').on('click', function(e) {
                e.preventDefault();
                let options = {
                    index: i,
                    showHideOpacity: true,
                    shareEl: false   // the template's Facebook/Tweet/Pin menu tweeted raw caption HTML
                }

                const opener = this,
                      $behind = $('.skip-link, .s-header, #main, .s-footer');

                // initialize PhotoSwipe
                let lightBox = new PhotoSwipe($pswp, PhotoSwipeUI_Default, items, options);

                // PhotoSwipe builds its <img> elements without alt, and adds
                // them after its own events have fired; copy the thumbnail's
                // alt onto each one as it appears.
                const altWatch = new MutationObserver(function() {
                    $($pswp).find('img.pswp__img').each(function() {
                        const src = this.getAttribute('src');
                        const it = items.find(function(x) { return x.src === src; });
                        if (it && this.getAttribute('alt') !== it.alt) { this.setAttribute('alt', it.alt); }
                    });
                });
                altWatch.observe($pswp, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });

                // Modal while open: nothing behind it takes focus, and focus
                // returns to the thumbnail that opened it.
                lightBox.listen('close', function() { $behind.prop('inert', false); });
                lightBox.listen('destroy', function() { altWatch.disconnect(); opener.focus(); });

                lightBox.init();
                $behind.prop('inert', true);
            });

        });
    };



   /* Animate On Scroll
    * ------------------------------------------------------ */
    const ssAOS = function() {
        
        AOS.init( {
            offset: 60,
            duration: 400,
            easing: 'ease-in-out',
            delay: 0,
            once: true,
            // Capability test, not a UA sniff. The old disable:'mobile' string
            // left iPads in their default desktop-UA mode animating, where 18
            // elements stayed stuck at opacity 0.
            disable: function() {
                return window.matchMedia('(pointer: coarse)').matches
                    || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            }
        });

        // Elements already inside the viewport on load can be left at opacity 0
        // by AOS's first pass, because it runs before layout settles. Force a
        // recalculation once it has.
        $WIN.on('load', function() { if (window.AOS) { AOS.refreshHard(); } });
        setTimeout(function() { if (window.AOS) { AOS.refreshHard(); } }, 600);

    };



   /* alert boxes
    * ------------------------------------------------------ */
    const ssAlertBoxes = function() {

        $('.alert-box').on('click', '.alert-box__close', function() {
            $(this).parent().fadeOut(500);
        }); 

    };

    
   /* smooth scrolling
    * ------------------------------------------------------ */
    const ssSmoothScroll = function() {
        
        $('.smoothscroll').on('click', function (e) {
            const target = this.hash;
            const $target = $(target);
            
            // jQuery's animation ignores the CSS scroll-behavior override
            const dur = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : cfg.scrollDuration;

            e.preventDefault();
            e.stopPropagation();

            $('html, body').stop().animate({
                'scrollTop': $target.offset().top
            }, dur, 'swing').promise().done(function () {
                window.location.hash = target;
            });
        });

    };


   /* hero video
    * ------------------------------------------------------ */
    const ssHeroVideo = function() {

        const video = document.querySelector('.s-hero video'),
              toggle = document.querySelector('.hero-video-toggle'),
              label = toggle && toggle.querySelector('.hero-video-toggle__label');

        if (!video || !label) return;

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

        // autoplay stays in the markup so the loop still runs if this script
        // does not; here it is paused for reduced motion or from the button.
        const setPaused = function(paused) {
            toggle.classList.toggle('is-paused', paused);
            label.textContent = paused ? 'Play video' : 'Pause video';
            if (paused) {
                video.pause();
            } else {
                const p = video.play();
                if (p && p.catch) { p.catch(function() {}); }
            }
        };

        toggle.hidden = false;
        toggle.addEventListener('click', function() {
            setPaused(!toggle.classList.contains('is-paused'));
        });

        if (reduce.matches) { setPaused(true); }

        const onMotionChange = function(e) { setPaused(e.matches); };
        if (reduce.addEventListener) {
            reduce.addEventListener('change', onMotionChange);
        } else if (reduce.addListener) {
            reduce.addListener(onMotionChange);
        }
    };


   /* back to top
    * ------------------------------------------------------ */
    const ssBackToTop = function() {
        
        const pxShow = 800;
        const $goTopButton = $(".ss-go-top")
        const phone = window.matchMedia('(max-width: 600px)');
        const cta = document.querySelector('.footer-email-us');
        let lastTop = $(window).scrollTop();
        let ctaInView = false;

        // On phones the disc sat over the right end of body lines and over
        // the Let's Talk button: there it shows only while the reader scrolls
        // up, and never while that button is on screen.
        const update = function() {
            const top = $(window).scrollTop(),
                  delta = top - lastTop;
            let show;

            if (top < pxShow) {
                show = false;
            } else if (!phone.matches) {
                show = true;
            } else if (ctaInView) {
                show = false;
            } else if (Math.abs(delta) < 6) {
                return;   // wait for a clear direction
            } else {
                show = delta < 0;
            }

            lastTop = top;
            $goTopButton.toggleClass('link-is-visible', show);
        };

        if (cta && 'IntersectionObserver' in window) {
            new IntersectionObserver(function(entries) {
                ctaInView = entries[0].isIntersecting;
                update();
            }).observe(cta);
        }

        update();
        $(window).on('scroll', update);
    };



   /* initialize
    * ------------------------------------------------------ */
    (function ssInit() {

        ssPreloader();
        ssMoveHeader();
        ssMobileMenu();
        ssAccordion();
        ssPhotoswipe();
        ssAOS();
        ssAlertBoxes();
        ssSmoothScroll();
        ssHeroVideo();
        ssBackToTop();

    })();

})(jQuery);