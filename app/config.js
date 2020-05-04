const config = {
	// host:'http://192.168.0.101/',
	host:'http://nghichcode.com/',
	path:'api/',
	getLocation:function(name) {
		return this.host+this.path+name;
	},
	getImage:function(name) {
		if(!name) {return null;}
		name = name.split('.').join('/');
		const dir = 'get_image/';
		return this.host+this.path+dir+name;
	},
	max_size:{width:768,height:1024},
	'encryption_key': 'eFQlByOIVdLnvhxus91H2dIqKq5W8OzF',
	'schemaVersion':2,
};

export default config;