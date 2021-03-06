Moralis.initialize("0GzizS6GbnQn6isYezO4JluphEVMsYSsRAKTWWAh");
Moralis.serverURL = "https://cavqbo93zybo.usemoralis.com:2053/server"
const TOKEN_CONTRACT_ADDRESS = "0x34caF0fe61CDB6690fF2cE709B2570BFCaADAfd8";

init = async () =>{
    hideElement(userInfo)
    hideElement(createItemForm)
    window.web3 = await Moralis.Web3.enable();
    window.tokenContract = new web3.eth.Contract(tokenContractAbi, TOKEN_CONTRACT_ADDRESS);
    initUser();
}

initUser = async () =>{
    if(await Moralis.User.current()){
        hideElement(userConnectButton)
        showElement(userProfileButton)
        showElement(openCreateItemButton)

    }else{
        showElement(userConnectButton)
        hideElement(userProfileButton)
        showElement(openCreateItemButton)
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
        const email=  user.get('email');
        if(email){
            userEmailField.value = email;
        }else{
            userEmailField.value = "";
        }
        userUserNameField.value = user.get('username');

        const userAvatar = user.get('avatar');
        if(userAvatar){
            userAvatarImg.src = userAvtar.url();
            showElement(userAvatarImg);
        }else{
            hideElement(userAvatarImg);
        }

        showElement(userInfo);

    }else{
        login();
    }
}

saveUserInfo = async () => {
    user.set('email', userEmailField.value); //!Requires validation
    user.set('username', userUserNameField.value);

    if (userAvatarFile.files.length > 0) {
        const avatar = new Moralis.File("avatar.jpg", userAvatarFile.files[0]);
        user.set('avatar', avatar);
    }
    await user.save();
    alert("User info saved successfully!");
    openUserInfo();


}

createItem = async () => {
    if(createItemFile.files.length == 0){
        alert("Please select a file!");
        return;
    }else if(createItemNameField.value.length ==0){
        alert("Please give the item a name!");
        return;
    }
    const nftFile = new Moralis.File("nftFile.jpg", createItemFile.files[0]);
    await nftFile.saveIPFS();

    const nftFilePath = nftFile.ipfs();
    const nftFileHash = nftFile.hash();

    const metadata = {
        name: createItemNameField.value,
        description: createItemDescriptionField.value,
        image: nftFilePath,
    }

    const nftFileMetaDataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
    await nftFileMetaDataFile.saveIPFS();

    const nftFileMetaDataFilePath = nftFileMetaDataFile.ipfs();
    const nftFileMetaDataFileHash = nftFileMetaDataFile.hash();

    const nftId = await mintNft(nftFileMetadataFilePath);

    const Item = Moralis.Object.extend("Item");

    //Create a new instance of that class
    const item = new Item();
    item.set('name', createItemNameField.value);
    item.set('description', createItemDescriptionField.value);
    item.set('nftFilePath', nftFilePath);
    item.set('nftFileHash', nftFileHash);
    item.set('metadataFilePath', nftFileMetadataFilePath);
    item.set('metadataFileHash', nftFileMetadataFileHash);
    item.set('nftId', nftId);
    item.set('nftContractAddress', TOKEN_CONTRACT_ADDRESS);
    await item.save();
    console.log(item);
}

mintNft = async(metadataUrl)=>{
    const receipt = await tokenContract.methods.createItem(metadataUrl).send({from:ethereum.selectedAddress});
    console.log(receipt);
    return receipt.events.Transfer.returnValues.tokenId;
}

//? Adapt to flutter
hideElement = (element) => element.style.display = "none";
showElement = (element) => element.style.display = "block";

//Navbar
const userConnectButton = document.getElementById("btnConnect");
userConnectButton.onclick = login;

const userProfileButton = document.getElementById("btnUserInfo");
userProfileButton.onclick = openUserInfo;

const openCreateItemButton = document.getElementById("btnOpenCreateItem");
openCreateItemButton.onclick = () => showElement(createItemForm);

// User Profile
const userInfo = document.getElementById("userInfo");
const userUserNameField = document.getElementById("txtUsername");
const userEmailField = document.getElementById("txtEmail");
const userAvatarImg = document.getElementById("imgAvatar");
const userAvatarFile = document.getElementById("fileAvatar");

document.getElementById("btnCloseUserInfo").onclick = ()=> hideElement(userInfo);
document.getElementById("btnLogout").onclick = logout;
document.getElementById("btnSaveUserInfo").onclick = saveUserInfo;

// Item creation
const createItemForm = document.getElementById("createItem");


const createItemNameField = document.getElementById("txtCreateItemName");
const createItemDescriptionField = document.getElementById("txtCreateItemDescription");
const createItemPriceField = document.getElementById("numCreateItemPrice");
const createItemStatusField = document.getElementById("selectCreateItemStatus");
const createItemFile = document.getElementById("fileCreateItemFile");

document.getElementById("btnCloseCreateItem").onclick = ()=> hideElement(createItemForm);
document.getElementById("btnCreateItem").onclick = createItem;

init();