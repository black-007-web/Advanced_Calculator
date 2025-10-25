// Hamburger Menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Highlight active section
const sections = document.querySelectorAll('section');
const navLi = document.querySelectorAll('nav ul li a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if(pageYOffset >= sectionTop){
      current = section.getAttribute('id');
    }
  });

  navLi.forEach(a => {
    a.classList.remove('active');
    if(a.getAttribute('href').includes(current)){
      a.classList.add('active');
    }
  });
});
