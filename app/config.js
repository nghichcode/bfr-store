const config = {
	host:'http://192.168.1.7/',
	path:'ignite-api/api/',
	getLocation:function(name) {
		return this.host+this.path+name;
	},
	getImge:function(name) {
		name = name.split('.').join('/');
		const dir = 'getimage/';
		return this.host+this.path+dir+name;
	},
	'encryption_key': 'eFQlByOIVdLnvhxus91H2dIqKq5W8OzF',
	'schemaVersion':1
};

export default config;