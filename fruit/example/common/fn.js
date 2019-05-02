/**
 * Created with JetBrains PhpStorm.
 * User: abuduweiliaikpaer
 * Date: 9/4/12
 * Time: 2:38 PM
 * To change this template use File | Settings | File Templates.
 */

insertAfter = function (new_node, existing_node) {
    if (existing_node.nextSibling) {
        existing_node.parentNode.insertBefore(new_node, existing_node.nextSibling);
    } else {
        existing_node.parentNode.appendChild(new_node);
    }
}

htmlEscape = function (str) {
    return String(str).replace(/</g, '&lt;');
}

prettyCode = function () {
    //prettyPrint();\
    var textarea = document.getElementsByTagName("textarea");
    for (var i in textarea) {
        var code = textarea[i].value;
        var pre = document.createElement("pre");
        pre.className = "prettyprint";
        if (code) {
            if (textarea[i].getAttribute("type") == 'js') {
                pre.innerHTML = htmlEscape(js_beautify(code.replace(/\s{2,}/g, "")));
            } else if (textarea[i].getAttribute("type") == 'java') {
                pre.innerText = code;
            } else if (textarea[i].getAttribute("type") == 'css') {
                pre.innerText = code;
            } else if (textarea[i].getAttribute("type") == 'html') {
                if (navigator.userAgent.indexOf("Firefox") != -1) {
                    pre.innerHTML = htmlEscape(style_html(code));
                } else {
                    pre.innerText = style_html(code);
                }

                //console.log(htmlEscape(style_html(code)));
            }
            insertAfter(pre, textarea[i]);
            //pre.innerHTML = js_beautify(style_html(code));
        }

    }

    //
    prettyPrint();
    // setTimeout(prettyPrint, 500);
}

loadColorTableLessFile = function (colorLessFilePath) {
    var variablesArray = [];
    if (!colorLessFilePath) {
        return;
    }
    $.ajax({
        url:colorLessFilePath,
        dataType:'text',
        success: function (data,status){
        var colorVariables = data;
        var matchAry = colorVariables.match(/@\D.*:\s.*/g);
        // //console.log(matchAry.toString());

        for (var i = 0; i < matchAry.length; i++) {
            if (matchAry[i].indexOf(":") != -1) {
                //0 //console.log(matchAry[i]);
                ////console.log(i);
                var temp = matchAry[i].split(":");
                var temp2 = temp[1].split(";");
                variablesArray.push([temp[0], temp2[0], temp2[1]]);//
                ////console.log(temp[1].substr(0, temp[1].length - 1)+"aaa");
            } else {
                ////console.log(matchAry[i]+"aaa");
            }


        }
        //con
        ////console.log(variablesArray);
        buildColorTable(variablesArray);
    }});
}

buildVariablesTable = function (variablesFile) {
    $.get(variablesFile, function (data) {
        var matchAry = data.match(/@\D.*:\s.*/g);
        var str = "<table class='f-table'>";
        for (var i in matchAry){
            if (matchAry[i].indexOf(":") != -1) {
                var temp = matchAry[i].split(":");
                var temp2 = temp[1].split(";");
                str += "<tr><td><code>"+temp[0] +"</code></td><td>"+temp2[0]+"</td></tr>";
            }

        }
        str +="</table>"
        $("#variables").html(str);
    })
}


buildColorTable = function (variablesArray) {
    var newItemDom = "";
    var obj = {};
    var itemDOM = "<tr><td><code>$1</code></td><td>$2</td><td><span style='background-color: $3;' class='cube'></span></td><td>$4</td></tr>";
    for (var i in variablesArray) {
        var color = variablesArray[i][1];


        if (color.indexOf("#") != -1) {
//                if(obj["Color-"+color.toString().substr(1)]){
//                    newItemDom += itemDOM.replace("$1", variablesArray[i][0]).replace("$2", color.toUpperCase()).replace("$3", color);//.replace("$4", obj["Color-"+color.toString().substr(1)].join(" , "));
//                    obj["Color-"+color.toString().substr(1)].push(variablesArray[i][0]);
//                }else{
//                    obj["Color-"+color.toString().substr(1)] = [variablesArray[i][0]];
//                    newItemDom += itemDOM.replace("$1", variablesArray[i][0]).replace("$2", color.toUpperCase()).replace("$3", color);//.replace("$4","");
//                }
            obj[variablesArray[i][0].substr(1)] = color;
            ////console.log(color+"aaa");
            newItemDom += itemDOM.replace("$1", variablesArray[i][0]).replace("$2", color.toUpperCase()).replace("$3", color).replace("$4", variablesArray[i][2]);


        } else {
            obj[variablesArray[i][0].substr(1)] = obj[color.substr(2)];
            newItemDom += itemDOM.replace("$1", variablesArray[i][0]).replace("$2", "<code>" + color + "</code>").replace("$3", obj[color.substr(2)]).replace("$4", variablesArray[i][2]);
        }
        //console.dir(obj);

    }
    $("#color-table-demo tbody").html(newItemDom);
}

loadICONSprite = function (icon_sprie) {
    //var icon_sprie = "../../css/futurama.css";
    $.get(icon_sprie + "#" + Math.random(), function (d) {
        //var class_ary = d.match(/icon-.*:hover\b|icon-.*\b/ig);
        var class_ary = d.match(/icon-\S+\w/g);
        var sprite = $("<dl>");
        for (var i = 0; i < class_ary.length; i++) {
            if (class_ary[i].indexOf(":") != -1) { // :hover
                continue;
            }
            var dd = $("<dd>").addClass("item");
            var icon = $("<span>").addClass(class_ary[i]);
            var code = $("<code>").text("." + class_ary[i]).addClass('code');

            dd.append(icon).append(code).appendTo(sprite);
        }
        sprite.appendTo("#icon-sprite");
    })
}