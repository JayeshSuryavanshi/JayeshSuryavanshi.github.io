

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
                alt  : $thumbLink.find('img').attr('alt') || '',
                big  : { src: $href, w: +$width, h: +$height },
                thumb: $thumbLink.find('img')[0]
            }

            // a phone does not need the 4K file: it would decode three of them
            // for the neighbours PhotoSwipe preloads
            const small = ($thumbLink.attr('data-small') || '').split(' ');
            if (small.length === 2) {
                const sz = small[1].split('x');
                item.small = { src: small[0], w: +sz[0], h: +sz[1] };
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

            item.fullTitle = item.title;
            items.push(item);
        });

        // Phones and short windows: the story starts folded, so the picture
        // keeps its room and the story opens over it on a tap.
        const compactQuery = window.matchMedia('(max-width: 600px), (max-height: 760px)');
        const foldStory = function(html) {
            const t = document.createElement('template');
            t.innerHTML = html;
            t.content.querySelectorAll('p.folio-story').forEach(function(p) {
                const details = document.createElement('details'),
                      summary = document.createElement('summary'),
                      body = document.createElement('p'),
                      label = p.querySelector('.folio-story__label');
                if (label) { label.remove(); }
                details.className = 'folio-story';
                summary.className = 'folio-story__label';
                summary.textContent = 'The story';
                body.innerHTML = p.innerHTML.trim();
                details.append(summary, body);
                p.replaceWith(details);
            });
            return t.innerHTML;
        };

        // PhotoSwipe reads every press as the start of a drag, so a swipe on
        // the caption moved or closed the picture; keep the caption's own
        // presses, scrolls and taps to itself.
        const caption = $pswp && $pswp.querySelector('.pswp__caption');
        if (caption) {
            ['pointerdown', 'mousedown', 'touchstart', 'wheel'].forEach(function(type) {
                caption.addEventListener(type, function(e) { e.stopPropagation(); }, { passive: true });
            });
            const markMore = function() {
                caption.classList.toggle('has-more', caption.scrollTop + caption.clientHeight < caption.scrollHeight - 4);
            };
            caption.addEventListener('scroll', markMore, { passive: true });
            caption.addEventListener('toggle', markMore, true);
            new MutationObserver(function() { requestAnimationFrame(markMore); })
                .observe(caption, { childList: true, subtree: true });
            window.addEventListener('resize', markMore);
        }

        // bind click event
        $folioItems.each(function(i) {

            $(this).find('.folio-item__thumb-link').on('click', function(e) {
                e.preventDefault();
                const compact = compactQuery.matches,
                      useSmall = window.matchMedia('(pointer: coarse)').matches
                          || window.innerWidth * (window.devicePixelRatio || 1) <= 1700;
                const stem = function(p) {
                    return p.split('/').pop().split('?')[0].replace(/\.(webp|png|jpe?g)$/, '').replace(/-(800|1200|1600|3150|3840)$/, '');
                };

                // fresh objects each time: PhotoSwipe caches load state on them
                const openItems = items.map(function(it) {
                    const v = (useSmall && it.small) || it.big,
                          o = { src: v.src, w: v.w, h: v.h, alt: it.alt,
                                title: it.fullTitle ? (compact ? foldStory(it.fullTitle) : it.fullTitle) : it.title };
                    // open on the thumbnail already on screen, when it is the same picture
                    const t = it.thumb && (it.thumb.currentSrc || it.thumb.getAttribute('src'));
                    if (t && stem(t) === stem(v.src)) { o.msrc = t; }
                    return o;
                });
                let options = {
                    index: i,
                    showHideOpacity: true,
                    shareEl: false   // the template's Facebook/Tweet/Pin menu tweeted raw caption HTML
                }

                const opener = this,
                      $behind = $('.skip-link, .s-header, #main, .s-footer');

                // initialize PhotoSwipe
                let lightBox = new PhotoSwipe($pswp, PhotoSwipeUI_Default, openItems, options);

                // PhotoSwipe builds its <img> elements without alt, and adds
                // them after its own events have fired; copy the thumbnail's
                // alt onto each one as it appears.
                const altWatch = new MutationObserver(function() {
                    $($pswp).find('img.pswp__img').each(function() {
                        const src = this.getAttribute('src');
                        const it = openItems.find(function(x) { return x.src === src || x.msrc === src; });
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

        const video = document.querySelector('.s-hero video');

        if (!video || !window.fetch || !window.URL || !URL.createObjectURL) return;

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)'),
              desktop = window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');

        // Preferred first. All three are the same 10 s loop from the 4K master.
        const sources = [
            { src: '/images/hero-4k-av1.mp4',  type: 'video/mp4; codecs="av01.0.12M.10"',    width: 3840, height: 2160, bitrate: 10431000 },
            { src: '/images/hero-4k-hevc.mp4', type: 'video/mp4; codecs="hvc1.1.6.L150.90"', width: 3840, height: 2160, bitrate: 13834000 },
            { src: '/images/hero-1080.mp4',    type: 'video/mp4; codecs="avc1.640028"',      width: 1920, height: 1080, bitrate: 9865000 }
        ];

        // Take the first file this browser decodes in hardware: a 4K AV1
        // decode in software keeps a whole CPU core busy. Without that
        // answer, fall back to the 1080p file every desktop decodes cheaply.
        const pick = function() {
            const mc = navigator.mediaCapabilities;
            if (!mc || !mc.decodingInfo) {
                const last = sources[sources.length - 1];
                return Promise.resolve(video.canPlayType(last.type) ? last : null);
            }
            return Promise.all(sources.map(function(s) {
                return mc.decodingInfo({ type: 'file', video: {
                    contentType: s.type, width: s.width, height: s.height, bitrate: s.bitrate, framerate: 25
                } }).catch(function() { return null; });
            })).then(function(res) {
                const ok = function(r, needEfficient) { return r && r.supported && (!needEfficient || r.powerEfficient); };
                for (let i = 0; i < sources.length; i++) { if (ok(res[i], true)) return sources[i]; }
                for (let i = sources.length - 1; i >= 0; i--) { if (ok(res[i], false)) return sources[i]; }
                return null;
            });
        };

        let onScreen = false, ready = false, started = false, startTimer = 0;

        const update = function() {
            if (!ready) return;
            if (reduce.matches || !onScreen || !desktop.matches) {
                video.pause();
            } else {
                const p = video.play();
                if (p && p.catch) { p.catch(function() {}); }
            }
        };

        // The still under the video is its frame 0, so until the whole file
        // is here the hero just looks paused; once it is, the loop never
        // waits on the network.
        const wanted = function() {
            const c = navigator.connection;
            return onScreen && desktop.matches && !reduce.matches && !(c && c.saveData);
        };

        const start = function() {
            if (started || !wanted()) return;
            started = true;
            pick().then(function(s) {
                // a deep link scrolls the hero away just after the first check
                if (!s || !wanted()) { started = false; return; }
                return fetch(s.src).then(function(r) {
                    if (!r.ok) throw new Error(r.status);
                    return r.blob();
                }).then(function(blob) {
                    video.muted = true;
                    video.src = URL.createObjectURL(blob);
                    ready = true;
                    update();
                });
            }).catch(function() {});
        };

        if ('IntersectionObserver' in window) {
            // Off screen below 1% visible. The About link lands with the
            // hero's edge touching the viewport, which still counts as
            // intersecting, and the last callback on the way out reports a
            // sliver just under the 1% threshold.
            new IntersectionObserver(function(entries) {
                onScreen = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.01;
                // the first report comes before a #fragment scroll: let it settle
                clearTimeout(startTimer);
                if (onScreen) { startTimer = setTimeout(start, 300); }
                update();
            }, { threshold: [0, 0.01] }).observe(document.querySelector('.s-hero'));
        } else {
            onScreen = true;
            start();
        }

        const onChange = function() {
            start();
            update();
        };
        [reduce, desktop].forEach(function(q) {
            if (q.addEventListener) {
                q.addEventListener('change', onChange);
            } else if (q.addListener) {
                q.addListener(onChange);
            }
        });
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