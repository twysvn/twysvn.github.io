function clear(){
    if ($('form .placeholder').val() == 'twysvn@gmail.com') {
        $('form .placeholder').val('');
        $('form .placeholder').css('color', 'rgba(255, 255, 255, 1)');
    }
}

function reset(){
    if ($('form .placeholder').val().length <= 0) {
        $('form .placeholder').val('twysvn@gmail.com');
        $('form .placeholder').css('color', 'rgba(255, 255, 255, 0.4)');
    }
}

$(document).ready(function(){
    document.getElementById('input').addEventListener("focus", clear);
    document.getElementById('input').addEventListener("blur", reset);
});
