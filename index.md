---
title:  About me
cover: true
---




<head>
<meta name="google-site-verification" content="PY0HOlPg1kjKYPy20mRGw7vIBzuM-56ngFJ0pgtMOso" />

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-144334033-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-144334033-1');
</script>


<script type="text/javascript">
var TxtRotate = function(el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = 2000;
  this.txt = '';
  this.tick();
  this.isDeleting = false;
};

TxtRotate.prototype.tick = function() {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];

  if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1);
  } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
  }

  this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

  var that = this;
  var delta = 100 - Math.random() * 100;

  if (this.isDeleting) { delta /= 2; }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === '') {
    this.isDeleting = false;
    this.loopNum++;
    delta = 100;
  }

  setTimeout(function() {
    that.tick();
  }, delta);
};

window.onload = function() {
  var elements = document.getElementsByClassName('txt-rotate');
  for (var i=0; i<elements.length; i++) {
    var toRotate = elements[i].getAttribute('data-rotate');
    var period = elements[i].getAttribute('data-period');
    if (toRotate) {
      new TxtRotate(elements[i], JSON.parse(toRotate), period);
    }
  }
 
  var css = document.createElement("style");
  css.type = "text/css";
  css.innerHTML = ".txt-rotate > .wrap { border-right: 0.08em solid #666 }";
  document.body.appendChild(css);
};

</script>

<img src='https://praked.github.io/assets/img/profilepic.jpg' align="right" style="width:40%;border:15px solid white" >

<p align="justify"> 
Hello! I'm Pranav Kedia, and I currently reside in Berlin, Germany, where I'm working as a research assistant for the EU H2020 project <a href="https://www.hiveopolis.eu/">'Hiveopolis'</a> at the <a href="http://berlinbiorobotics.blog/">Biorobtics Lab</a> led by <a href="https://www.mi.fu-berlin.de/inf/groups/ag-ki/members/Professoren/Tim_Landgraf.html">Prof. Dr. Tim Landgraf</a> at  the <a href="https://www.fu-berlin.de/en/index.html">Free Univeristy of Berlin</a>.  I completed my master's majoring in electronics and communication with a specialization in embedded systems at <a href="https://www.iiitb.ac.in/">IIIT-B</a>. Previously, I was fortunate to be part of the <a href="https://www.iiitb.ac.in/sarl/sarl.html">Surgical and Assistive Robotics Lab</a>, led by <a href="https://www.iiitb.ac.in/faculty_page.php?name=madhavrao">Prof. Madhav Rao</a>. I was also part of the <a href="http://www.sc.iitb.ac.in/robotics/people.html">ARMS  lab</a>, led by <a href="https://sites.google.com/iitb.ac.in/arpitasinha">Dr. Arpita Sinha</a> at IIT Bombay, India, in the summer of 2019. <a href="https://www.iiitb.ac.in/faculty/sachit-rao">Prof. Sachit Rao</a> has also supervised me on some guided coursework and non-coursework-related projects. 

I enjoy working on Bio-inspired Swarm Robotics and Swarm Intelligence methods. You can find details of my <a href="https://praked.github.io/publications/">Publications</a> and <a href="https://praked.github.io/projects/">Projects</a> here.

</p>

<h2 align="left"> Research and other interests</h2>
<p align="justify"> I am interested in multi-agent and swarm robotics and its applications, human-robot interaction. Building novel robots has always excited me.</p> 

<p align="justify"> Apart from my work, I enjoy traveling and learning about new cultures and languages. I like to find interconnections and variations of languages in different places. I love to sketch and paint. I am also an avid reader of world politics and history.
</p> 
    
<h2 align="left"> News/Updates</h2>
<small>
<p align="justify">Nov'21: Prototypes of Dancing Honey Bee Robot developed this year at the Biorobotics lab at FU Berlin for the EU H2020 project 'Hiveopolis'. </p>   
<p align="justify"><iframe width="100%" height="315" src="https://www.youtube.com/embed/AymwDn5S6bg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></p>  
<p align="justify">Feb'21: Our paper titled <a href="https://praked.github.io/publications/GenGrid:-A-Generalised-Distributed-Experimental-Environmental-Grid-for-Swarm-Robotics">"GenGrid: A Generalised Distributed Experimental Environmental Grid for Swarm Robotics"</a> was accepted at <a href="http://www.icra2021.org/">ICRA 2021</a>. This paper is based on my masters thesis and co-authored with my supervisor Prof. Madhav Rao. </p>
<p align="justify">Jan'21: I joined the Biorobotics lab at FU Berlin as a research assistant for the EU H2020 project 'Hiveopolis'. </p>  
<p align="justify">Sep'20: Successfully defended my masters thesis. </p>
<p align="justify">Sep'20: I submitted my thesis titled "GENGRID: A Generalised Reconfigurable Distributed Experimental Environmental Grid For Swarm Robotics." </p>
<p align="justify">Apr'20: Our paper titled <a href="https://praked.github.io/publications/Design-of-a-real-time-autonomous-in-cabin-sensory-system-to-detect-passenger-anomaly">"Design of a real-time autonomous in-cabin sensory system to detect passenger anomaly"</a> was accepted at <a href="https://2020.ieee-iv.org/">IV 2020 Workshops</a>. Here our focus is on building intelligent transportation systems and designing in-cabin low-cost sensors for passenger state identification. We use sensor fusion techniques and various machine learning algorithms for testing our prototype. </p> 
<p align="justify">Mar'20: Unfortunately, I am temporarily postponing my thesis work due to the nationwide lockdown caused by the COVID-19 outbreak. Stay safe folks.  </p>
<p align="justify">Jan'20: Started working on my thesis work with a goal to develop a scalable distributed agent environment for swarm robotics experiments. </p>
<p align="justify">Sep'19: I presented our paper and research work at the 2019 IEEE International Conference on Vehicular Electronics and Safety <a href="http://icves2019.org/">ICVES 2019</a> in Cairo, Egypt at the German University in Cairo. </p>
<p align="justify">July'19: Our paper titled <a href="https://praked.github.io/publications/Design-and-development-of-an-autonomous-emergency-vigilance-system-for-passenger-vehicle">"Design and development of an autonomous in-seat passenger state identification in a modern vigilance enabled public transportation system"</a> was accepted at <a href="http://icves2019.org/">ICVES 2019</a>. My research focuses on building intelligent transportation systems and designing sensors for passenger state identification. </p> 
<p align="justify">May'19 - July'19: Worked at the <a href="http://www.sc.iitb.ac.in/robotics/people.html">ARMS  lab</a>, led by <a href="https://www.sc.iitb.ac.in/~asinha/">Dr. Arpita Sinha</a> at IIT Bombay, India.  I worked on additive and subtractive self-assembly algorithms for a swarm of Kilobots. </p>
<p align="justify"><iframe width="100%" height="315"  src="https://www.youtube.com/embed/InnujVZMI3A" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></p>
<p align="justify"><iframe width="100%" height="315" src="https://www.youtube.com/embed/9_uDLp4NzWI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></p>
</small>




