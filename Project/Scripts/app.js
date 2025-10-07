let Quantity  = document.getElementById("cboQty").value
let Distance = document.getElementById("numDistance").value

let radSix = document.getElementById("radSix")
let radTwelve = document.getElementById("radTwelve")
let radTwoFour = document.getElementById("radTwoFour")
let selectedPack = 0
let selectedDistance = 0

let Requirements = false

// function DistanceFunc(){
//     if (Distance < 20 && Requirements == false){
//         alert("0-20")
//         selectedDistance = 5
//     } else if (Distance = 20 < 30 ) {
//         alert("20-30")
//         selectedDistance = 10
//     } else if (Distance = 30 < 50) {
//         alert("30-50")
//         selectedDistance = 15
//     } else if (Distance > 50) {
//         alert("We do not ship to your location")
//     }
// }

// function ChkBoxesFunc(){
//     if (radSix.checked == true && Requirements == false){
//         selectedPack = radSix.value
//     } else if (radTwelve.checked == true){
//         selectedPack = radTwelve.value
//     } else if (radTwoFour.checked == true){
//         selectedPack = radTwoFour.value
//     }
// let subTotal = (Quantity * selectedPack)
// }


function CaculatePrice(){
    if (Distance == ""){
        alert("Distance is required")
        Requirements = true
    } else if (Quantity == 0){
        alert("Select a quanitity")
        Requirements = true
    } else if(Distance == "" && Quantity == 0){
        alert("a")
    } else{
        Requirements =  false
    }

    // ChkBoxes
    if (radSix.checked == true && Requirements == false){
        selectedPack = radSix.value
    } else if (radTwelve.checked == true){
        selectedPack = radTwelve.value
    } else if (radTwoFour.checked == true){
        selectedPack = radTwoFour.value
    }
let subTotal = (Quantity * selectedPack)

    // Distance

    if (Distance < 20 && Requirements == false){
        selectedDistance = 5
    } else if (Distance = 20 >= 30 <= 20 ) {
        selectedDistance = 10
    } else if (Distance = 30 >= 50 <= 30) {
        selectedDistance = 15
    } else if (Distance >= 50) {
        alert("We do not ship to your location")
    }

    if (Requirements == false){
        alert(`SubTotal: $${subTotal} \nShipping: $${Distance} \nGrandTotal: $${Distance + subTotal}`);
    }
}


let orderButton = document.getElementById("btnOrder");
orderButton.addEventListener('click', function(){
CaculatePrice();
});
