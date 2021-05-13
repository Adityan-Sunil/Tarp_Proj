function sendData(data,server,callback, async = false){
    var xhtp = new XMLHttpRequest(); //Creating connection variable 
    xhtp.onreadystatechange = function(){
        if(this.readyState === 4 && this.status === 200){
            callback(this.responseText); // Response from server
        }
    }
    xhtp.open("POST",server,async);//Creating connection to backend path ("/addVendor")
    xhtp.setRequestHeader("Content-Type","application/json")
    xhtp.send(JSON.stringify(data));//Sending data 
}