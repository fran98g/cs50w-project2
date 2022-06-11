localStorage.clear()

function login(){
    let form = document.querySelector("#login_form");
    let msg_span = document.getElementById('msg');

    let data = new FormData(form);

    let request = new XMLHttpRequest();

    request.open('POST','/login');
    request.send(data);

    request.onreadystatechange = function(){
            if(request.readyState == 4){
                if(request.status == 200){
                    msg.textContent = request.responseText

                    let username  =  document.querySelector('#username').value;

                    localStorage.setItem("username", username);
                    localStorage.setItem("room", "general")

                    window.location = "/"
                    return false;
                }
                else{

                    msg.textContent = request.responseText
                    return false;
                }

            }

        }

}