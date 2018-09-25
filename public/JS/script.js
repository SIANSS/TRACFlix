var getUrl = window.location;
var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
// console.log(getUrl.pathname);
var goodColor = "#82FF84";
var badColor = "#FF7476";

var logins = [
  {
    user:"Sian",
    mail:"acsian7@gmail.com",
    pwd:"sicar96"
  },
  {
    user:"Arul",
    mail:"Arularul@gmail.com",
    pwd:"dondon"
  },
  {
    user:"Varun",
    mail:"VarunPuvan@gmail.com",
    pwd:"Varun"
  },
  {
    user:"Goutham",
    mail:"Fastbowler@gmail.com",
    pwd:"cricket"
  },
  {
    user:"Shakila",
    mail:"ShailaSothy@gmail.com",
    pwd:"Shaila"
  }];
  /* Filter Method */
  filterSelection("all");
  function filterSelection(passing_letter) {
    var x, i;
    x = document.getElementsByClassName("imgframe");
    if (passing_letter == "all")/* You clcick a  */ c = "";
    // Add the "show" class (display:block) to the filtered elements, and remove the "show" class from the elements that are not selected
    for (i = 0; i < x.length; i++) {
      w3RemoveClass(x[i], "show");
      if (x[i].className.indexOf(passing_letter) > -1) w3AddClass(x[i], "show");
    }
  }

  // Show filtered elements
  function w3AddClass(element, name) {
    var i, arr1, arr2;
    arr1 = element.className.split(" ");
    arr2 = name.split(" ");
    for (i = 0; i < arr2.length; i++) {
      if (arr1.indexOf(arr2[i]) == -1) {
        element.className += " " + arr2[i];
      }
    }
  }

  // Hide elements that are not selected
  function w3RemoveClass(element, name) {
    var i, arr1, arr2;
    arr1 = element.className.split(" ");
    arr2 = name.split(" ");
    for (i = 0; i < arr2.length; i++) {
      while (arr1.indexOf(arr2[i]) > -1) {
        arr1.splice(arr1.indexOf(arr2[i]), 1);
      }
    }
    element.className = arr1.join(" ");
  }

  // Add active class to the current control button (highlight it)
  var btnContainer = document.getElementsByClassName("xpagination");
  var btns = document.getElementById("ch-btn");
  for (var i = 0; i < btnContainer.length; i++) {
    btns[i].addEventListener("click", function() {
      var current = document.getElementsByClassName("active");
      current[0].className = current[0].className.replace(" active", "");
      this.className += " active";
    });
  }
  /* END OF Filter Function */
  /* Input Validation */
  function checkval(movieaddbox)
  {
    //Store the Confimation Message Object ...
    var message2 = document.getElementById('Message2');
    var required = "";
    var letters=/^[A-Za-z]+[\w ]+[\w ]+[\w ]$/;
    var btn = document.getElementById('normbut');

    if(movieaddbox.value == required)
    {
      message2.style.color = badColor;
      message2.innerHTML = "Please Enter a TV Series Title";
      btn.disabled = true;
    }
    else if(movieaddbox.value.match(letters)){
      message2.innerHTML = "";
      btn.disabled = false;
    }
    else
    {
      //The Text do not match.
      //notify the user.
      message2.style.color = badColor;
      message2.innerHTML = "Invalid TV Show name"
      btn.disabled = true;
    }
  }

  function output(){
    document.getElementById('Message2').innerHTML = "TV Show name has been added";
  }


  function namevalidation(uname){
    var message = document.getElementById('namemsg');
    var matchfix = /^[A-Za-z]+$/;

    if(uname.value == ""){
      message.innerHTML = "Your Name is Required";
      uname.style.border = "2px red solid";
      document.getElementById("btn-reg").disabled = true;
    }
    else{// for password
      if(uname.value.match(matchfix) && uname.value.length >= 5){
        message.innerHTML = "";
        uname.style.border = ".5px black solid";
        document.getElementById("btn-reg").disabled = false;
      }
      else{
        message.innerHTML = "Your Name is invalid";
        uname.style.border = "2px red solid";
        document.getElementById("btn-reg").disabled = true;
      }
    }
  }

  function mailvalidate(email){
    var message = document.getElementById('mailmsg');
    var matchfix = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(email.value == ""){
      message.innerHTML = "Your Email Address is Required";
      document.getElementById("btn-reg").disabled = true;
    }
    else{// for password
      if(email.value.match(matchfix)){
        message.innerHTML = "";
        email.style.border = ".5px black solid";
        email.style.backgroundColor = "#FFF";
        document.getElementById("btn-reg").disabled = false;
      }
      else{
        message.innerHTML = "Your Email Id is invalid";
        email.style.backgroundColor = "#FF7476";
        document.getElementById("btn-reg").disabled = true;
      }
    }
  }

  function passval(pwd){
    var lowerCaseLetters = /[a-z]/g;
    var upperCaseLetters = /[A-Z]/g;
    var numbers = /[0-9]/g;

    if(pwd.value !== ""){
      pwd.style.backgroundColor = "#FFF";
      if(pwd.value.match(lowerCaseLetters)){
        document.getElementById('low').style.color = goodColor;
        document.getElementById("btn-reg").disabled = false;
      }
      else{
        document.getElementById('low').style.color = badColor;
        document.getElementById("btn-reg").disabled = true;
      }
      if(pwd.value.match(upperCaseLetters)){
        document.getElementById('up').style.color = goodColor;
        document.getElementById("btn-reg").disabled = false;
      }
      else{
        document.getElementById('up').style.color = badColor;
        document.getElementById("btn-reg").disabled = true;
      }
      if(pwd.value.match(numbers)){
        document.getElementById('num').style.color = goodColor;
        document.getElementById("btn-reg").disabled = false;
      }
      else{
        document.getElementById('num').style.color = badColor;
        document.getElementById("btn-reg").disabled = true;
      }
      if(pwd.value.length >= 8){
        document.getElementById('length').style.color = goodColor;
        document.getElementById("btn-reg").disabled = false;
      }
      else{
        document.getElementById('length').style.color = badColor;
        document.getElementById("btn-reg").disabled = true;
      }
    }
    else
    {
      pwd.style.backgroundColor = "#FF7476";
    }


  }
  console.log(logins);


  function Register(uname, email, pwd){
    msg = document.getElementById("passmsg");
    if(uname.value !== "" && email.value !== "" && pwd.value !== ""){
      logins.unshift({user:uname.value, mail:email.value, pwd:pwd.value});
      console.log(logins);
    }
    else{
      document.getElementById("btn-reg").disabled = true;
    }
  }

  // while(logins.length <= 4){
  //   logins.unshift({name:uname.value, mail:email.value, pwd:pwd.value});
  //   console.log(logins);

  function check(mailer, passsword){
    var message = document.getElementById("Message");
    if(mailer.value !== ""){
      if(passsword.value !== ""){
        for(i=0; i < logins.length; i++){
          if(mailer.value === logins[i].mail){
            if(passsword.value === logins[i].pwd){
              message.style.color = goodColor;
              message.innerHTML = "Login Success";
              break;
            }
            else{
              message.style.color = badColor;
              message.innerHTML = "Login Failed, Incorrect password";
              break;
            }
          }
          else{
            message.style.color = badColor;
            message.innerHTML = "Login Failed, Incorrect Email";
            break;
          }
        }
      }
      else{
        message.style.color = badColor;
        message.innerHTML = "Please Enter Password"
      }
    }
    else{
      message.style.color = badColor;
      message.innerHTML = "Please Enter Email";
    }
  }


  function search(x){
    document.getElementById('rootus').innerHTML = "";
    var dat = x.value;
    console.log(dat);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function (){
      if(this.readyState == 4 && this.status == 200){
        var data = JSON.parse(this.responseText);

        console.log(data);
        for (var i = 0; i < data.length; i++) {
          document.getElementById('rootus').innerHTML += '<div class="imgframe S action horror adventure fantasy comedy show"> <!-- supernatural horror action comedy --><div class="img-holder"><a href="/getseries/'+data[i].id+'"><img src="'+data[i].banner+'" alt=""></a></div><div class="ititle"><p class="title">'+data[i].seriesName+'</p><p class="epsd"><b>Network :</b> '+data[i].network+'</p></div></div>'
        }
      }
    }

    xhttp.open("GET", baseUrl+"search/"+dat, true);
    xhttp.send();
  }
