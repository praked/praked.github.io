---
layout: page
title: Leisurely amusements
description: >
  Photographs from Pranav Kedia's travels, a visited-countries map, and other
  things he enjoys away from a screen.
hide_description: true
sitemap: True
---
<style>
/* Scoped to the slideshow. These used to be global rules (`*`, `body`, `img`)
   inside an invalid nested <head>, which overrode the site font on this page. */
.slideshow-container, .slideshow-container * { box-sizing: border-box }
.slideshow-container img { vertical-align: middle }
.mySlides {display: none}

/* Slideshow container */
.slideshow-container {
  max-width: 1000px;
  position: relative;
  margin: auto;
}

/* Next & previous buttons */
.prev, .next {
  cursor: pointer;
  position: absolute;
  top: 50%;
  width: auto;
  padding: 16px;
  margin-top: -22px;
  color: white;
  font-weight: bold;
  font-size: 18px;
  transition: 0.6s ease;
  border-radius: 0 3px 3px 0;
}

/* Position the "next button" to the right */
.next {
  right: 0;
  border-radius: 3px 0 0 3px;
}

/* On hover, add a black background color with a little bit see-through */
.prev:hover, .next:hover {
  background-color: rgba(0,0,0,0.8);
}

/* Caption text */
.slideshow-container .text {
  color: #f2f2f2;
  font-size: 15px;
  padding: 8px 12px;
  position: absolute;
  bottom: 8px;
  width: 100%;
  text-align: center;
}

/* Number text (1/3 etc) */
.numbertext {
  color: #f2f2f2;
  font-size: 12px;
  padding: 8px 12px;
  position: absolute;
  top: 0;
}

/* The dots/bullets/indicators */
.dot {
  cursor: pointer;
  height: 15px;
  width: 15px;
  margin: 0 2px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
  transition: background-color 0.6s ease;
}

.dot.active, .dot:hover {
  background-color: #717171;
}

/* Fading animation */
.fade {
  -webkit-animation-name: fade;
  -webkit-animation-duration: 1.5s;
  animation-name: fade;
  animation-duration: 1.5s;
}

@-webkit-keyframes fade {
  from {opacity: .4} 
  to {opacity: 1}
}

@keyframes fade {
  from {opacity: .4} 
  to {opacity: 1}
}

/* On smaller screens, decrease text size */
@media only screen and (max-width: 300px) {
  .prev, .next, .slideshow-container .text {font-size: 11px}
}
/* Clickable areas overlay for slide navigation */
.slide-image-container {
  position: relative;
}

.slide-image-container img {
  display: block;
  width: 100%;
}

/* Overlay clickable areas */
.click-area {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  cursor: pointer;
  background: rgba(0, 0, 0, 0); /* Transparent by default */
}

.click-area.left {
  left: 0;
}

.click-area.right {
  right: 0;
}

/* Optional: Visual feedback on hover */
.click-area:hover {
  background: rgba(0, 0, 0, 0.1);
}


</style>

<p><strong>Misc</strong></p>


<p align="justify"> When I'm away from all my electronic devices I need few things to have a good time. Apart from my friends, good view where I can put my photography skills to use, LEDs and <a href="https://en.wikipedia.org/wiki/pizza">Pizza</a> top that list. </p>

<p align="justify"> The first 18 years of my life were spent in a small town called <a href="https://en.wikipedia.org/wiki/Faridabad">Faridabad</a>. Where ever I go, this town always travels with me and always enriches me. </p>

This is my travelog in the form of images from various places I visited.
  
<br/>

<div class="slideshow-container">
  
<div class="mySlides fade">
  <div class="numbertext">1</div>
  <div class="slide-image-container">
  <img src="/assets/img/travel/berlin.jpg" alt="berlin" loading="lazy" style="width:100%">
    <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>
  <div class="text">Berlin, Germany</div>
</div>
 <div class="mySlides fade">
  <div class="numbertext">2</div>
   <div class="slide-image-container">
  <img src="/assets/img/travel/leipzig.jpg" alt="leipzig" loading="lazy" style="width:100%">
     <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>
  <div class="text">Leipzig, Germany</div>
</div>
 <div class="mySlides fade">
  <div class="numbertext">3</div>
   <div class="slide-image-container">
  <img src="/assets/img/travel/dresden.jpg" alt="dresden" loading="lazy" style="width:100%">
     <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>
  <div class="text">Dresden, Germany</div>
</div>
 <div class="mySlides fade">
  <div class="numbertext">4</div>
   <div class="slide-image-container">
  <img src="/assets/img/travel/frankfurt.jpg" alt="frankfurt" loading="lazy" style="width:100%">
     <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>
  <div class="text">Frankfurt, Germany</div>
</div> 
 <div class="mySlides fade">
  <div class="numbertext">5</div>
   <div class="slide-image-container">
  <img src="/assets/img/travel/abu_dh.jpg" alt="abu_dh" loading="lazy" style="width:100%">
     <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>
  <div class="text">Abu Dhabi, UAE</div>
</div>
<div class="mySlides fade">
  <div class="numbertext">6</div>
  <div class="slide-image-container">
  <img src="/assets/img/travel/sphinx.jpg" alt="sphinx" loading="lazy" style="width:100%">
    <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>
  <div class="text">Pyramids of Giza, Egypt</div>
</div>
<div class="mySlides fade">
  <div class="numbertext">7</div>
  <div class="slide-image-container">
  <img src="/assets/img/travel/Zagazig.jpg" alt="Zagazig" loading="lazy" style="width:100%">
    <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>
  <div class="text">Zagazig, Egypt</div>
</div>

<div class="mySlides fade">
  <div class="numbertext">8</div>
  <div class="slide-image-container">
  <img src="/assets/img/travel/Auroville.jpg" alt="Auroville" loading="lazy" style="width:100%">
    <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>
  <div class="text">Auroville, India</div>
</div>


<div class="mySlides fade">
  <div class="numbertext">9</div>
  <div class="slide-image-container">
  <img src="/assets/img/travel/Rock_beach_aerial_view.jpg" alt="Rock_beach_aerial_view" loading="lazy" style="width:100%">
    <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>
  <div class="text">Pondicherry, India</div>
</div>

<div class="mySlides fade">
  <div class="numbertext">10</div>
  <div class="slide-image-container">
  <img src="/assets/img/travel/mumbai.jpg" alt="mumbai" loading="lazy" style="width:100%">
    <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>
  <div class="text">Mumbai, India</div>
</div>
<div class="mySlides fade">
  <div class="numbertext">11</div>
  <div class="slide-image-container">
  <img src="/assets/img/travel/gwalior.jpg" alt="gwalior" loading="lazy" style="width:100%">
    <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>
  <div class="text">Gwalior, India</div>
</div>
<div class="mySlides fade">
  <div class="numbertext">12</div>
  <div class="slide-image-container">
  <img src="/assets/img/travel/mangalore.jpg" alt="mangalore" loading="lazy" style="width:100%">
    <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>
  <div class="text">Mangalore, India</div>
</div>
<div class="mySlides fade">
  <div class="numbertext">13</div>
  <div class="slide-image-container">
  <img src="/assets/img/travel/delhi.jpg" alt="delhi" loading="lazy" style="width:100%">
    <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>
  <div class="text">Delhi, India</div>
</div>
<div class="mySlides fade">
  <div class="numbertext">14</div>
  <div class="slide-image-container">
  <img src="/assets/img/travel/Amsterdam.jpg" alt="Amsterdam" loading="lazy" style="width:100%">
    <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>
  <div class="text">Amsterdam, Netherlands</div>
</div>
<div class="mySlides fade">
  <div class="numbertext">15</div>
  <div class="slide-image-container">
  <img src="/assets/img/travel/Hamburg.jpg" alt="Hamburg" loading="lazy" style="width:100%;height:60%">
    <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>
  <div class="text">Hamburg, Germany</div>
</div>
<div class="mySlides fade">
  <div class="numbertext">16</div>
  <div class="slide-image-container">
  <img src="/assets/img/travel/Prague.jpg" alt="Prague" loading="lazy" style="width:100%">
  <!-- Left half for previous slide -->
    <div class="click-area left" onclick="plusSlides(-1)"></div>
    <!-- Right half for next slide -->
    <div class="click-area right" onclick="plusSlides(1)"></div>
  </div>  
  <div class="text">Prague, Czechia</div>
</div>  

<a class="prev" onclick="plusSlides(-1)">&#10094;</a>
<a class="next" onclick="plusSlides(1)">&#10095;</a>

</div>
<br>

<div style="text-align:center">
  <span class="dot" onclick="currentSlide(1)"></span> 
  <span class="dot" onclick="currentSlide(2)"></span> 
  <span class="dot" onclick="currentSlide(3)"></span> 
  <span class="dot" onclick="currentSlide(4)"></span> 
  <span class="dot" onclick="currentSlide(5)"></span> 
  <span class="dot" onclick="currentSlide(6)"></span> 
  <span class="dot" onclick="currentSlide(7)"></span> 
  <span class="dot" onclick="currentSlide(8)"></span>
  <span class="dot" onclick="currentSlide(9)"></span> 
  <span class="dot" onclick="currentSlide(10)"></span>
  <span class="dot" onclick="currentSlide(11)"></span> 
  <span class="dot" onclick="currentSlide(12)"></span>
  <span class="dot" onclick="currentSlide(13)"></span> 
  <span class="dot" onclick="currentSlide(14)"></span>
  <span class="dot" onclick="currentSlide(15)"></span> 
  <span class="dot" onclick="currentSlide(16)"></span>


</div>

<script>
// Globals, because the slide markup uses inline onclick handlers.
var slideIndex = 1;

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  if (!slides.length) return;
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  if(dots[slideIndex-1]) {
    dots[slideIndex-1].className += " active";
  }
}

// Hydejack navigates with hy-push-state, which does not re-run injected
// <script> tags. Re-initialise on arrival so the slideshow works when this
// page is reached by client-side navigation, not just a full load.
(function () {
  slideIndex = 1;
  showSlides(slideIndex);
  var pushStateEl = document.getElementById('_pushState');
  if (pushStateEl && !pushStateEl.dataset.miscSlidesBound) {
    pushStateEl.dataset.miscSlidesBound = '1';
    pushStateEl.addEventListener('hy-push-state-after', function () {
      slideIndex = 1;
      showSlides(slideIndex);
    });
  }
})();
</script>

<h2>My Travel Map</h2>
<div style="max-width:980px;margin:5px auto 10px auto;font-size:14px;"><div style="position:relative;padding: 0 0 67% 0;height:0;overflow:hidden;"><iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" src="https://www.fla-shop.com/visited-countries/embed/?st=AE%2CAL%2CAM%2CAT%2CBE%2CCH%2CCN%2CCZ%2CDE%2CEE%2CEG%2CES%2CFI%2CFR%2CGE%2CHR%2CHU%2CIN%2CIT%2CKW%2CKZ%2CLT%2CLV%2CME%2CNL%2CNO%2CPT%2CRS%2CSE%2CSI%2CSK%2CTH%2CTR%2CUS&vc=1ca032&uc=b3c3ca&hc=40bfa6&bc=ffffff" frameborder="0" scrolling="no"></iframe></div>Create a map on <a href="https://www.fla-shop.com/visited-countries/">Fla-shop.com</a></div>
<!-- <img src="/assets/img/travel/2025_travel_map.png"
     alt="Markdown Monster icon"
     style="float: left; margin-right: 10px;" />
-->

