// src/lib/bootstrapHandlers.js

export function setupBootstrapHandlers() {

    $(document).on("click", "[data-bs-toggle='modal']", function (e) {
        e.preventDefault();

        const target = $(this).data("bs-target");
        const modal = $(target);

        modal.addClass("d-block");
        setTimeout(() => {
            modal.addClass("show");
        }, 10);

        if (!$(".modal-backdrop").length) {
            $('<div class="modal-backdrop fade"></div>').appendTo(document.body);
            setTimeout(() => {
                $(".modal-backdrop").addClass("show");
            }, 10);
        }

        $("body").addClass("modal-open");
        $("body").css({ overflow: "hidden", paddingRight: "15px" });
    });

    function closeModal(modal) {
        modal.removeClass("show");
        $(".modal-backdrop").removeClass("show");

        setTimeout(() => {
            modal.removeClass("d-block");
            $(".modal-backdrop").remove();
            $("body").removeClass("modal-open");
        }, 300);
    }

    $(document).on(
        "click",
        ".modal .btn-close, .modal .btn-secondary,[data-bs-dismiss='modal']",
        function () {
            const modal = $(this).closest(".modal");
            closeModal(modal);
        }
    );
    $(document).on("click", "[data-bs-toggle='dropdown']", function (e) {
        e.preventDefault();

        const toggle = $(this);
        const parent = toggle.closest(".dropdown");
        const menu = parent.find(".dropdown-menu");
        const position = menu.data('popper-placement');

        const isOpen = toggle.hasClass("show");

        $(".dropdown-toggle").removeClass("show");
        $(".dropdown-menu").removeClass("show").removeAttr("style");

        if (!isOpen) {
            toggle.addClass("show");
            menu.addClass("show");

            const toggleOffset = toggle.offset();
            const toggleHeight = toggle.outerHeight();
            const toggleWidth = toggle.outerWidth();
            const menuWidth = menu.outerWidth();

            let top = '0px', left = '0px', right = '0px', bottom = '0px';

            switch (position) {
                case 'top-start':
                    top = 'auto';
                    left = 'auto';
                    right = '0px';
                    bottom = '0px';
                    break;
                case 'top-end':
                    top = 'auto';
                    left = 'auto';
                    right = '0px';
                    bottom = '0px';
                    break;
                case 'bottom-start':
                    top = 'auto';
                    left = 'auto';
                    right = '0px';
                    bottom = '0px';
                    break;
                case 'bottom-end':
                    top = 'auto';
                    left = 'auto';
                    right = '0px';
                    bottom = '0px';
                    break;
                case 'left-start':
                    top = 'auto';
                    left = 'auto';
                    right = '0px';
                    bottom = '0px';
                    break;
                case 'right-start':
                    top = 'auto';
                    left = 'auto';
                    right = '0px';
                    bottom = '0px';
                    break;
                // Add more cases as needed
                default:
                    top = '0px';
                    left = '0px';
                    right = 'auto';
                    bottom = 'auto';
            }

            menu.css({
                position: "absolute",
                inset: `${top} ${left} ${bottom} ${right}`,
                margin: "0px",
                transform: "translate(0px, 41px)"
            });
        } else {
            toggle.removeClass("show");
            menu.removeClass("show").removeAttr("style");
        }
    });


    $(document).on("click", function (e) {
        if (!$(e.target).closest(".dropdown").length) {
            $(".dropdown-toggle").removeClass("show");
            $("[data-bs-toggle='dropdown']").removeClass("show");
            $(".dropdown-menu").removeClass("show").removeAttr("style");
        }
    });
}
