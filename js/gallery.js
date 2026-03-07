$(document).ready(function () {
    // 1. Tab Switching Logic (Similar to index.html)
    $('.tab-button').click(function () {
        const tabId = $(this).attr('data-tab');

        $('.tab-button').removeClass('active');
        $('.tab-content').removeClass('active');

        $(this).addClass('active');
        $('#' + tabId).addClass('active');
    });

    // 2. Carousel Logic
    $('.next-btn').click(function () {
        const track = $(this).siblings('.carousel-view').find('.carousel-track');
        const images = track.find('img');
        const firstImage = images.first();

        // Move track
        track.animate({ marginLeft: '-100%' }, 500, function () {
            track.append(firstImage).css('marginLeft', '0');
        });
    });

    $('.prev-btn').click(function () {
        const track = $(this).siblings('.carousel-view').find('.carousel-track');
        const images = track.find('img');
        const lastImage = images.last();

        track.css('marginLeft', '-100%').prepend(lastImage);
        track.animate({ marginLeft: '0' }, 500);
    });
});