Moralis.initialize("0GzizS6GbnQn6isYezO4JluphEVMsYSsRAKTWWAh");
Moralis.serverURL = "https://cavqbo93zybo.usemoralis.com:2053/server"

init = async () =>{
    hideElement(userInfo)
    window.web3 = await Moralis.Web3.enable();
    initUser();
}

initUser = async () =>{
    if(await Moralis.User.current()){
        hideElement(userConnectButton)
        showElement(userProfileButton)

    }else{
        showElement(userConnectButton)
        hideElement(userProfileButton)
    }
}

login = async () => {
    try {
        await Moralis.Web3.authenticate();
        initUser();
    }catch(error){
        alert(error);
    }
}

logout = async () =>{
    await Moralis.User.logOut();
    hideElement(userInfo)
    initUser(); //reload no user page state
}

openUserInfo = async () => {
    user = await Moralis.User.current();
    if(user){
        showElement(userInfo);

    }else{
        login();
    }
}

//Adapt to flutter
hideElement = (element) => element.style.display = "none";
showElement = (element) => element.style.display = "block";

const userConnectButton = document.getElementById("btnConnect");
userConnectButton.onclick = login;

const userProfileButton = document.getElementById("btnUserInfo");
userProfileButton.onclick = openUserInfo;

const userInfo = document.getElementById("userInfo");
document.getElementById("btnCloseUserInfo").onclick = ()=> hideElement(userInfo);
document.getElementById("btnLogout").onclick = logout;

init();