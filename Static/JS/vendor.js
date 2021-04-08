function regVendor(){
    data = {"ID":$("#vendor-dbsearch").val()}; //Data to be sent...vendor-dbsearch is the id of the form
    var xhtp = new XMLHttpRequest(); //Creating connection variable 
    xhtp.onreadystatechange = function(){
        if(this.readyState === 4 && this.status === 200){
            console.log(this.responseText); // Response from server
        }
    }
    xhtp.open("POST","/addVendor",false);//Creating connection to backend path ("/addVendor")
    xhtp.send(JSON.stringify(data));//Sending data
}

function unregVendor(){
    data = {}
}