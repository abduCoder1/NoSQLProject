var button = new Audio();
button.src = "audio/odin-klik-myshki.mp3"

function playButton(num) {
  button.play();
}

var btn = new Audio();
btn.src = "audio/buttonclickrelease.mp3"

function playButton(num) {
  btn.play();
}
document.onclick = () => applyCursorRippleEffect(event);

function applyCursorRippleEffect(e) {
   const ripple = document.createElement("div");

   ripple.className = "ripple";
   document.body.appendChild(ripple);

  ripple.style.left = `${e.clientX}px`;
  ripple.style.top = `${e.clientY}px`;
   ripple.style.animation = `ripple-effect .4s  linear`;
   ripple.onanimationend = () => {
     document.body.removeChild(ripple);
   }
}

const burgerMenu = document.querySelector('.burger-menu');
const menu = document.querySelector('.menu');
const lines = document.querySelectorAll('.line');

burgerMenu.addEventListener('click', function() {
    menu.classList.toggle('open');
    lines[0].classList.toggle('line1');
    lines[1].classList.toggle('line2');
    lines[2].classList.toggle('line3');
});