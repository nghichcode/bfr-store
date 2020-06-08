function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function parseDate(date, locale=true){
  let ldate = '';
  if(locale) {
    if (date && new Date(date)!='Invalid Date'){
      ldate = new Date(date).toISOString().slice(0, 10).split('-');
      ldate = ldate[2]+'/'+ldate[1]+'/'+ldate[0];
    }
  } else {
  	if(date && typeof date=='string'){
	    ldate = date.split('/');
	    if (ldate.length!=3) {return '';}
	    ldate = (ldate[2]+'-'+ldate[1]+'-'+ldate[0]);
  	}
  }
  return ldate;
}


function parseForm(params) {
  let formData = new FormData();
  for (let k in params) {
  	if (Array.isArray(params[k])) {
  		let list = params[k];
  		for(let i=0;i<list.length;i++){formData.append(k+'[]', list[i]);}
  	} else {formData.append(k, params[k]);}
  }
  return formData;
}

function vi2en(viTxt) {
  viTxt = viTxt.toLowerCase();
	var str = "";
	var viLoo="àáạảãâầấậẩẫăằắặẳẵòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữèéẹẻẽêềếệểễỳýỵỷỹìíịỉĩđ";
	var enLoo="aaaaaaaaaaaaaaaaaooooooooooooooooouuuuuuuuuuueeeeeeeeeeeyyyyyiiiiid";
	
	// 17,17,11,11,5,5,1 = 67
	for (var i = 0; i < viTxt.length; i++) {
		var tmp=viTxt[i];
		for (var j = 0; j < viLoo.length; j++) {
			if (viTxt[i]==viLoo[j]) { tmp=enLoo[j];break; }
		}
		str+=tmp;
	}
    // return {res:str,finish:function () {console.log("Finish:"+Date.now());}};
    return str;
}
// var viUpp="ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ";
function vi2en_r(viTxt) {
    var str = viTxt;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
    str = str.replace(/ + /g," ");
    str = str.trim(); 
    return str;
}

// crd2m(21.213885,105.854878,21.213873,105.854236)
// crd2m({lat:21.213885,lng:105.854878},{lat:21.213873,lng:105.854236}) = 66m
const crd2m=function(f,t){
	// lat1, lng1, lat2, lng2
	try {
		if (typeof f === 'string') {
			const af=f.split(';');
			if(af.length!=2){return 0;}
			f={lat:parseFloat(af[0]),lng:parseFloat(af[1])};
		}
		if (typeof t === 'string') {
			const at=t.split(';');
			if(at.length!=2){return 0;}
			t={lat:parseFloat(at[0]),lng:parseFloat(at[1])};
		}
	} catch (e) {
		return 0;
	}
	const lat1=f.lat;
	const lng1=f.lng;
	const lat2=t.lat;
	const lng2=t.lng;
	const toRadians = function(d) { return d*Math.PI/180; }

	var R = 6371e3; // metres
	var phi1 = toRadians(lat1);
	var phi2 = toRadians(lat2);
	var delta_phi = toRadians(lat2-lat1);
	var delta_lambda = toRadians(lng2-lng1);
	var a = Math.pow( Math.sin(delta_phi/2),2 ) + Math.cos(phi1)*Math.cos(phi2)*Math.pow( Math.sin(delta_lambda/2),2 );
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var d = R * c;
	return d.toFixed(2);
}


export {
	parseForm, parseDate, crd2m, normalize
};