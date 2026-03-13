// navbar scroll effect

const nav=document.getElementById("mainNav");
window.addEventListener("scroll",()=>{
    nav.classList.toggle("scrolled",window.scrollY > 60);
});

// scroll reveal

const revealElements = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries)=>{
    entries.forEach((e)=>{
        if(e.isIntersecting){
            e.target.classList.add("visible");
            observer.unobserve(e.target);
        }
    });
},{threshold:0.12});

revealElements.forEach((e)=>observer.observe(e));