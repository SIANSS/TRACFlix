var getUrl = window.location;
var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
console.log(baseUrl);


if(getUrl.pathname == '/'){
  getall();
}


function getall(){
  var xhrhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var data = JSON.parse(this.responseText);
      console.log(data);
    }
  };
  xhttp.open("GET", "/api/shows", true);
  xhttp.send();
}
