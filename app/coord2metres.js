const crd2m=function(lat1, lng1, lat2, lng2){
	var R = 6371e3; // metres
	var phi1 = lat1.toRadians();
	var phi2 = lat2.toRadians();
	var delta_phi = (lat2-lat1).toRadians();
	var delta_lambda = (lng2-lng1).toRadians();
	var a = Math.pow( Math.sin(delta_phi/2),2 ) + Math.cos(phi1)*Math.cos(phi2)*Math.pow( Math.sin(delta_lambda/2),2 );
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var d = R * c;
	return d;
}
// dbl(21.213885,105.854878,21.213873,105.854236) = 66.56305270540962
export crd2m;